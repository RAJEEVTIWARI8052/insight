from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import get_current_user
from app.models import Notification, User

router = APIRouter(prefix="/api/notifications", tags=["notifications"])


@router.get("/")
async def get_notifications(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    notifications = (
        db.query(Notification)
        .filter(Notification.recipientId == current_user.id)
        .order_by(Notification.createdAt.desc())
        .limit(20)
        .all()
    )
    return [
        {
            "id": n.id,
            "recipientId": n.recipientId,
            "senderId": n.senderId,
            "type": n.type,
            "message": n.message,
            "link": n.link,
            "isRead": n.isRead,
            "createdAt": n.createdAt.isoformat() if n.createdAt else None,
            "updatedAt": n.updatedAt.isoformat() if n.updatedAt else None,
        }
        for n in notifications
    ]


@router.get("/unread-count")
async def get_unread_count(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    count = (
        db.query(Notification)
        .filter(Notification.recipientId == current_user.id, Notification.isRead == False)
        .count()
    )
    return {"count": count}


@router.put("/mark-read")
async def mark_as_read(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    db.query(Notification).filter(
        Notification.recipientId == current_user.id,
        Notification.isRead == False,
    ).update({"isRead": True})
    db.commit()
    return {"message": "Notifications marked as read"}
