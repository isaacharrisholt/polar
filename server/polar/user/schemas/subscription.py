from datetime import datetime

from pydantic import UUID4, Field

from polar.kit.schemas import EmailStrDNS, Schema, TimestampedSchema
from polar.models.subscription import SubscriptionStatus
from polar.product.schemas import Product, ProductPrice


class UserSubscriptionBase(TimestampedSchema):
    id: UUID4
    status: SubscriptionStatus
    current_period_start: datetime
    current_period_end: datetime | None
    cancel_at_period_end: bool
    started_at: datetime | None
    ended_at: datetime | None

    user_id: UUID4
    product_id: UUID4
    price_id: UUID4 | None


class UserSubscriptionProduct(Product): ...


class UserSubscription(UserSubscriptionBase):
    product: UserSubscriptionProduct
    price: ProductPrice | None


class UserFreeSubscriptionCreate(Schema):
    product_id: UUID4 = Field(
        ...,
        description="ID of the free tier to subscribe to.",
    )
    customer_email: EmailStrDNS | None = Field(
        None,
        description=(
            "Email of the customer. "
            "This field is required if the API is called outside the Polar app."
        ),
    )


class UserSubscriptionUpdate(Schema):
    product_price_id: UUID4
