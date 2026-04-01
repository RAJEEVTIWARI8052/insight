import uuid
from datetime import datetime, timezone

from sqlalchemy import (
    Column,
    String,
    Integer,
    Boolean,
    DateTime,
    Text,
    ForeignKey,
)
from sqlalchemy.orm import relationship

from app.database import Base


def _uuid() -> str:
    return str(uuid.uuid4())


def _utcnow() -> datetime:
    return datetime.now(timezone.utc)


class User(Base):
    __tablename__ = "User"

    id = Column(String(191), primary_key=True, default=_uuid)
    name = Column(String(191), nullable=True)
    username = Column(String(191), nullable=True)
    email = Column(String(191), unique=True, nullable=False)
    clerkId = Column(String(191), unique=True, nullable=True)
    password = Column(String(191), nullable=True)
    avatar = Column(String(191), nullable=True)
    bio = Column(String(191), nullable=True)

    otp = Column(String(191), nullable=True)
    otpExpiry = Column(DateTime, nullable=True)
    isVerified = Column(Boolean, default=False, nullable=False)
    role = Column(String(50), default="user", nullable=False)
    experience = Column(Integer, default=0, nullable=False)
    expertise = Column(Text, nullable=True)  # JSON string for SQLite

    createdAt = Column(DateTime, default=_utcnow, nullable=False)
    updatedAt = Column(DateTime, default=_utcnow, onupdate=_utcnow, nullable=False)

    # Relationships
    questions = relationship(
        "Question", back_populates="author", foreign_keys="Question.authorId"
    )
    mentioned_in = relationship(
        "Question",
        back_populates="mentionedExpert",
        foreign_keys="Question.mentionedExpertId",
    )
    responses = relationship("Response", back_populates="author")
    notifications_to = relationship(
        "Notification",
        back_populates="recipient",
        foreign_keys="Notification.recipientId",
    )
    notifications_from = relationship(
        "Notification",
        back_populates="sender",
        foreign_keys="Notification.senderId",
    )
    upvotes = relationship("QuestionUpvote", back_populates="user")


class Question(Base):
    __tablename__ = "Question"

    id = Column(String(191), primary_key=True, default=_uuid)
    title = Column(String(191), nullable=False)
    content = Column(Text, nullable=True)
    topic = Column(String(191), nullable=True)
    imageUrl = Column(String(191), default="", nullable=True)

    authorId = Column(String(191), ForeignKey("User.id"), nullable=True)
    author = relationship(
        "User", back_populates="questions", foreign_keys=[authorId]
    )

    mentionedExpertId = Column(String(191), ForeignKey("User.id"), nullable=True)
    mentionedExpert = relationship(
        "User", back_populates="mentioned_in", foreign_keys=[mentionedExpertId]
    )

    answerCount = Column(Integer, default=0, nullable=False)
    category = Column(String(191), default="General", nullable=True)
    expertResponse = Column(Text, default="", nullable=True)
    status = Column(String(50), default="open", nullable=False)

    createdAt = Column(DateTime, default=_utcnow, nullable=False)
    updatedAt = Column(DateTime, default=_utcnow, onupdate=_utcnow, nullable=False)

    # Relationships
    responses = relationship(
        "Response", back_populates="question", cascade="all, delete-orphan"
    )
    upvotes = relationship(
        "QuestionUpvote", back_populates="question", cascade="all, delete-orphan"
    )


class QuestionUpvote(Base):
    __tablename__ = "QuestionUpvote"

    questionId = Column(
        String(191), ForeignKey("Question.id", ondelete="CASCADE"), primary_key=True
    )
    userId = Column(
        String(191), ForeignKey("User.id", ondelete="CASCADE"), primary_key=True
    )

    question = relationship("Question", back_populates="upvotes")
    user = relationship("User", back_populates="upvotes")


class Response(Base):
    __tablename__ = "Response"

    id = Column(String(191), primary_key=True, default=_uuid)
    text = Column(Text, nullable=True)

    questionId = Column(
        String(191), ForeignKey("Question.id", ondelete="CASCADE"), nullable=False
    )
    question = relationship("Question", back_populates="responses")

    authorId = Column(
        String(191), ForeignKey("User.id", ondelete="CASCADE"), nullable=True
    )
    author = relationship("User", back_populates="responses")

    createdAt = Column(DateTime, default=_utcnow, nullable=False)


class Notification(Base):
    __tablename__ = "Notification"

    id = Column(String(191), primary_key=True, default=_uuid)

    recipientId = Column(
        String(191), ForeignKey("User.id", ondelete="CASCADE"), nullable=False
    )
    recipient = relationship(
        "User", back_populates="notifications_to", foreign_keys=[recipientId]
    )

    senderId = Column(
        String(191), ForeignKey("User.id", ondelete="CASCADE"), nullable=True
    )
    sender = relationship(
        "User", back_populates="notifications_from", foreign_keys=[senderId]
    )

    type = Column(String(50), default="general", nullable=False)
    message = Column(Text, nullable=False)
    link = Column(String(191), nullable=True)
    isRead = Column(Boolean, default=False, nullable=False)

    createdAt = Column(DateTime, default=_utcnow, nullable=False)
    updatedAt = Column(DateTime, default=_utcnow, onupdate=_utcnow, nullable=False)
