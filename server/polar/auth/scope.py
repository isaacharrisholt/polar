from enum import StrEnum

from pydantic import GetJsonSchemaHandler
from pydantic.json_schema import JsonSchemaValue
from pydantic_core import core_schema as cs


class Scope(StrEnum):
    openid = "openid"
    profile = "profile"
    email = "email"
    articles_read = "articles:read"  # article read only scope (used by RSS auth)
    user_read = "user:read"

    admin = "admin"  # Admin scope. For Polar staff only.
    web_default = "web_default"  # Web default scope. For users logged in on the web.

    organizations_read = "organizations:read"
    organizations_write = "organizations:write"

    creator_subscriptions_read = "creator:subscriptions:read"
    creator_subscriptions_write = "creator:subscriptions:write"

    creator_products_read = "creator:products:read"
    creator_products_write = "creator:products:write"

    creator_benefits_read = "creator:benefits:read"
    creator_benefits_write = "creator:benefits:write"

    creator_orders_read = "orders:read"

    creator_files_read = "creator:files:read"
    creator_files_write = "creator:files:write"

    creator_metrics_read = "metrics:read"

    webhooks_read = "webhooks:read"
    webhooks_write = "webhooks:write"

    user_benefits_read = "user:benefits:read"
    user_orders_read = "user:orders:read"
    user_subscriptions_read = "user:subscriptions:read"
    user_subscriptions_write = "user:subscriptions:write"
    user_advertisement_campaigns_read = "user:advertisement_campaigns:read"
    user_advertisement_campaigns_write = "user:advertisement_campaigns:write"

    user_downloadables_read = "user:downloadables:read"

    @classmethod
    def __get_pydantic_json_schema__(
        cls, core_schema: cs.CoreSchema, handler: GetJsonSchemaHandler
    ) -> JsonSchemaValue:
        json_schema = handler(core_schema)
        json_schema = handler.resolve_ref_schema(json_schema)
        json_schema["enumNames"] = SCOPES_SUPPORTED_DISPLAY_NAMES
        return json_schema


RESERVED_SCOPES = {Scope.admin, Scope.web_default}
SCOPES_SUPPORTED = [s.value for s in Scope if s not in RESERVED_SCOPES]
SCOPES_SUPPORTED_DISPLAY_NAMES: dict[Scope, str] = {
    Scope.openid: "OpenID",
    Scope.profile: "Read your profile",
    Scope.email: "Read your email address",
    Scope.web_default: "Web Default",
    Scope.articles_read: "Articles Read",
    Scope.user_read: "User Read",
    Scope.creator_subscriptions_read: "Read subscription tiers and subscribers",
    Scope.creator_subscriptions_write: "Create or modify subscription tiers and subscribers",
    Scope.creator_benefits_read: "Read benefits",
    Scope.creator_benefits_write: "Create or modify benefits",
    Scope.webhooks_read: "Read webhooks",
    Scope.webhooks_write: "Create or modify webhooks",
    Scope.creator_files_read: "Read & Download Files",
    Scope.creator_files_write: "Upload Files",
    Scope.user_downloadables_read: "Read Downloadable Files",
}


def scope_to_set(scope: str) -> set[Scope]:
    return {Scope(x) for x in scope.strip().split()}


def scope_to_list(scope: str) -> list[Scope]:
    return list(scope_to_set(scope))
