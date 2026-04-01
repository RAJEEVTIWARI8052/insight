import re
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session, joinedload

from app.database import get_db
from app.dependencies import get_current_user
from app.models import Question, QuestionUpvote, Response, Notification, User
from app.schemas import CreateQuestionRequest, ExpertResponseRequest, AddAnswerRequest
from app.utils.profanity import find_abusive_word

router = APIRouter(prefix="/api/questions", tags=["questions"])

# ── Stopwords for duplicate detection ────────────────────────────────────────

STOPWORDS = {
    "the", "a", "an", "is", "in", "on", "of", "to", "and", "or", "how",
    "why", "what", "when", "where", "i", "my", "me", "we", "can", "do", "does",
    "for", "with", "this", "that", "it", "be", "was", "are", "not", "has", "have",
}

# ── Intelligent topic classifier ─────────────────────────────────────────────

TOPIC_MAPPINGS = [
    ("Malware Analysis", ["virus", "worm", "ransomware", "trojan", "malware", "reverse",
                          "forensic", "payload", "obfuscation", "spyware", "adware",
                          "rootkit", "backdoor", "emotet", "cobalt strike", "binary", "assembly"]),
    ("Network Security", ["firewall", "vlan", "network", "dns", "ip", "proxy", "packet",
                          "sniffing", "wifi", "port", "vpn", "router", "switch", "ips",
                          "ids", "tcp", "udp", "icmp", "arp"]),
    ("Penetration Testing", ["kali", "metasploit", "pentest", "vulnerability", "scanner",
                             "exploit", "red team", "burp", "nmap", "privilege escalation",
                             "lateral movement", "bypass", "payload", "poc"]),
    ("Cryptography", ["encryption", "decryption", "hash", "crypto", "sha256", "aes", "rsa",
                      "kyber", "quantum", "tls", "ssl", "cipher", "pkc", "steganography",
                      "signature", "md5"]),
    ("DevSecOps", ["ci/cd", "pipeline", "docker", "kubernetes", "terraform", "automation",
                   "jenkins", "github actions", "k8s", "container", "microservices",
                   "sast", "dast", "iac"]),
    ("Web Exploitation", ["xss", "sql", "injection", "csrf", "owasp", "header", "cookie",
                          "bypass", "web", "appsec", "html", "js", "directory traversal",
                          "lfi", "rfi", "brute force", "ssrf"]),
    ("Incident Response", ["attack", "breached", "alert", "soc", "log", "monitor", "response",
                           "triage", "incident", "siem", "splunk", "forensics", "endpoint",
                           "edr", "compromise", "threat hunting"]),
]


def classify_issue(title: str, content: str | None) -> str:
    text = f"{title} {content or ''}".lower()
    for topic, keywords in TOPIC_MAPPINGS:
        if any(kw in text for kw in keywords):
            return topic
    return "General"


# ── Helper: format question for API response ─────────────────────────────────

def _format_question(q: Question) -> dict:
    author_data = None
    if q.author:
        author_data = {"name": q.author.name, "email": q.author.email}

    responses_data = []
    for r in q.responses:
        r_author = None
        if r.author:
            r_author = {"name": r.author.name, "email": r.author.email}
        responses_data.append({
            "id": r.id,
            "text": r.text,
            "questionId": r.questionId,
            "authorId": r.authorId,
            "author": r_author,
            "createdAt": r.createdAt.isoformat() if r.createdAt else None,
        })

    upvotes_list = [uv.userId for uv in q.upvotes]

    return {
        "id": q.id,
        "title": q.title,
        "content": q.content,
        "topic": q.topic,
        "imageUrl": q.imageUrl,
        "authorId": q.authorId,
        "author": author_data,
        "mentionedExpertId": q.mentionedExpertId,
        "answerCount": q.answerCount,
        "category": q.category,
        "expertResponse": q.expertResponse,
        "status": q.status,
        "createdAt": q.createdAt.isoformat() if q.createdAt else None,
        "updatedAt": q.updatedAt.isoformat() if q.updatedAt else None,
        "responses": responses_data,
        "upvotes": upvotes_list,
    }


def _question_to_simple_dict(q: Question) -> dict:
    """Minimal dict without eager-loaded relations (for create/update returns)."""
    return {
        "id": q.id,
        "title": q.title,
        "content": q.content,
        "topic": q.topic,
        "imageUrl": q.imageUrl,
        "authorId": q.authorId,
        "mentionedExpertId": q.mentionedExpertId,
        "answerCount": q.answerCount,
        "category": q.category,
        "expertResponse": q.expertResponse,
        "status": q.status,
        "createdAt": q.createdAt.isoformat() if q.createdAt else None,
        "updatedAt": q.updatedAt.isoformat() if q.updatedAt else None,
    }


# ── GET /api/questions/check-duplicate ───────────────────────────────────────

@router.get("/check-duplicate")
async def check_duplicate(
    title: str = Query(default=""),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if not title or len(title) < 5:
        return None

    normalized = title.strip()

    # 1. Exact match
    exact = (
        db.query(Question)
        .filter(
            Question.title.contains(normalized),
            Question.status == "answered",
            Question.expertResponse != "",
            Question.expertResponse.isnot(None),
        )
        .order_by(Question.createdAt.desc())
        .first()
    )
    if exact:
        return {"expertResponse": exact.expertResponse, "originalTitle": exact.title}

    # 2. Keyword-based fuzzy match
    keywords = [
        w
        for w in re.sub(r"[^\w\s]", "", normalized.lower()).split()
        if len(w) >= 3 and w not in STOPWORDS
    ]
    if not keywords:
        return None

    # Build OR conditions
    from sqlalchemy import or_

    conditions = [Question.title.contains(kw) for kw in keywords]
    candidates = (
        db.query(Question)
        .filter(
            or_(*conditions),
            Question.status == "answered",
            Question.expertResponse != "",
            Question.expertResponse.isnot(None),
        )
        .limit(20)
        .all()
    )

    scored = []
    for q in candidates:
        tl = q.title.lower()
        score = sum(1 for kw in keywords if kw in tl)
        if score >= min(2, len(keywords)):
            scored.append((q, score))

    if not scored:
        return None

    scored.sort(key=lambda x: x[1], reverse=True)
    best = scored[0][0]

    return {"expertResponse": best.expertResponse, "originalTitle": best.title}


# ── POST /api/questions/ ─────────────────────────────────────────────────────

@router.post("/")
async def create_question(
    body: CreateQuestionRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if not body.title:
        raise HTTPException(status_code=400, detail="Title is required")

    abusive_title = find_abusive_word(body.title)
    abusive_content = find_abusive_word(body.content) if body.content else None
    if abusive_title or abusive_content:
        return {
            "message": "Your post contains inappropriate language.",
            "abusiveWord": abusive_title or abusive_content,
        }

    normalized = body.title.strip()
    category = classify_issue(body.title, body.content)

    # Check for existing answered question (dedup)
    if not body.bypassDeduplication:
        existing = (
            db.query(Question)
            .filter(
                Question.title.contains(normalized),
                Question.status == "answered",
            )
            .order_by(Question.createdAt.desc())
            .first()
        )

        if existing:
            question = Question(
                title=body.title,
                content=body.content,
                topic=body.topic or category,
                category=category,
                imageUrl=body.imageUrl or "",
                authorId=current_user.id,
                mentionedExpertId=body.mentionedExpertId,
                expertResponse=existing.expertResponse,
                status="answered",
            )
            db.add(question)
            db.commit()
            db.refresh(question)

            result = _question_to_simple_dict(question)
            result["autoResolved"] = True
            result["originalResolutionId"] = existing.id
            return result

    question = Question(
        title=body.title,
        content=body.content,
        topic=body.topic or category,
        category=category,
        imageUrl=body.imageUrl or "",
        authorId=current_user.id,
        mentionedExpertId=body.mentionedExpertId,
    )
    db.add(question)
    db.commit()
    db.refresh(question)

    # Create notification for mentioned expert
    if body.mentionedExpertId:
        notif = Notification(
            recipientId=body.mentionedExpertId,
            senderId=current_user.id,
            type="mention",
            message=f'You were mentioned in a new inquiry: "{body.title}"',
            link=f"/question/{question.id}",
        )
        db.add(notif)
        db.commit()

    return _question_to_simple_dict(question)


# ── GET /api/questions/ ──────────────────────────────────────────────────────

@router.get("/")
async def get_all_questions(db: Session = Depends(get_db)):
    questions = (
        db.query(Question)
        .options(
            joinedload(Question.author),
            joinedload(Question.responses).joinedload(Response.author),
            joinedload(Question.upvotes),
        )
        .order_by(Question.createdAt.desc())
        .all()
    )

    # Deduplicate due to joinedload producing duplicates
    seen = set()
    unique = []
    for q in questions:
        if q.id not in seen:
            seen.add(q.id)
            unique.append(q)

    return [_format_question(q) for q in unique]


# ── PUT /api/questions/{id}/respond ──────────────────────────────────────────

@router.put("/{question_id}/respond")
async def add_expert_response(
    question_id: str,
    body: ExpertResponseRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if current_user.role != "expert":
        raise HTTPException(status_code=403, detail="Only experts can respond to issues.")

    question = db.query(Question).filter(Question.id == question_id).first()
    if not question:
        raise HTTPException(status_code=404, detail="Question not found")

    question.expertResponse = body.response
    question.status = "answered"
    question.updatedAt = datetime.now(timezone.utc)
    db.commit()
    db.refresh(question)

    # Notify question author
    if question.authorId and question.authorId != current_user.id:
        notif = Notification(
            recipientId=question.authorId,
            senderId=current_user.id,
            type="expert_response",
            message=f'An expert has provided a definitive solution to your inquiry: "{question.title}"',
            link=f"/question/{question.id}",
        )
        db.add(notif)
        db.commit()

    return _question_to_simple_dict(question)


# ── DELETE /api/questions/{id} ───────────────────────────────────────────────

@router.delete("/{question_id}")
async def delete_question(
    question_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    question = db.query(Question).filter(Question.id == question_id).first()
    if not question:
        raise HTTPException(status_code=404, detail="Question not found")

    db.delete(question)
    db.commit()
    return {"message": "Issue deleted successfully."}


# ── PUT /api/questions/{id}/upvote ───────────────────────────────────────────

@router.put("/{question_id}/upvote")
async def upvote_question(
    question_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    existing = (
        db.query(QuestionUpvote)
        .filter(QuestionUpvote.questionId == question_id, QuestionUpvote.userId == current_user.id)
        .first()
    )

    if existing:
        db.delete(existing)
        db.commit()
    else:
        upvote = QuestionUpvote(questionId=question_id, userId=current_user.id)
        db.add(upvote)
        db.commit()

        # Notify author
        question = db.query(Question).filter(Question.id == question_id).first()
        if question and question.authorId and question.authorId != current_user.id:
            notif = Notification(
                recipientId=question.authorId,
                senderId=current_user.id,
                type="upvote",
                message=f'Your inquiry "{question.title}" received a new upvote.',
                link=f"/question/{question.id}",
            )
            db.add(notif)
            db.commit()

    # Return updated question
    updated = (
        db.query(Question)
        .options(
            joinedload(Question.author),
            joinedload(Question.responses).joinedload(Response.author),
            joinedload(Question.upvotes),
        )
        .filter(Question.id == question_id)
        .first()
    )
    return _format_question(updated)


# ── PUT /api/questions/{id}/downvote ─────────────────────────────────────────

@router.put("/{question_id}/downvote")
async def downvote_question(
    question_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    existing = (
        db.query(QuestionUpvote)
        .filter(QuestionUpvote.questionId == question_id, QuestionUpvote.userId == current_user.id)
        .first()
    )

    if existing:
        db.delete(existing)
        db.commit()

    updated = (
        db.query(Question)
        .options(
            joinedload(Question.author),
            joinedload(Question.responses).joinedload(Response.author),
            joinedload(Question.upvotes),
        )
        .filter(Question.id == question_id)
        .first()
    )
    return _format_question(updated)


# ── POST /api/questions/{id}/answers ─────────────────────────────────────────

@router.post("/{question_id}/answers")
async def add_answer(
    question_id: str,
    body: AddAnswerRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if not body.content or not body.content.strip():
        raise HTTPException(status_code=400, detail="Answer content is required.")

    abusive = find_abusive_word(body.content)
    if abusive:
        return {"message": "Your answer contains inappropriate language.", "abusiveWord": abusive}

    response = Response(
        text=body.content.strip(),
        questionId=question_id,
        authorId=current_user.id,
    )
    db.add(response)

    question = db.query(Question).filter(Question.id == question_id).first()
    if not question:
        raise HTTPException(status_code=404, detail="Question not found")

    question.answerCount = (question.answerCount or 0) + 1
    question.updatedAt = datetime.now(timezone.utc)
    db.commit()

    # Notify author
    if question.authorId and question.authorId != current_user.id:
        notif = Notification(
            recipientId=question.authorId,
            senderId=current_user.id,
            type="general",
            message=f'Someone answered your question: "{question.title}"',
            link=f"/question/{question.id}",
        )
        db.add(notif)
        db.commit()

    # Return updated question with all relations
    updated = (
        db.query(Question)
        .options(
            joinedload(Question.author),
            joinedload(Question.responses).joinedload(Response.author),
            joinedload(Question.upvotes),
        )
        .filter(Question.id == question_id)
        .first()
    )
    return _format_question(updated)


# ── DELETE /api/questions/{questionId}/answers/{answerId} ─────────────────────

@router.delete("/{question_id}/answers/{answer_id}")
async def delete_answer(
    question_id: str,
    answer_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    answer = db.query(Response).filter(Response.id == answer_id).first()
    if not answer:
        raise HTTPException(status_code=404, detail="Answer not found")

    if answer.authorId != current_user.id and current_user.role != "expert":
        raise HTTPException(status_code=403, detail="Not authorized to delete this answer")

    db.delete(answer)

    question = db.query(Question).filter(Question.id == question_id).first()
    if question:
        question.answerCount = max((question.answerCount or 0) - 1, 0)
        question.updatedAt = datetime.now(timezone.utc)

    db.commit()

    # Return updated question
    updated = (
        db.query(Question)
        .options(
            joinedload(Question.author),
            joinedload(Question.responses).joinedload(Response.author),
            joinedload(Question.upvotes),
        )
        .filter(Question.id == question_id)
        .first()
    )
    return _format_question(updated)
