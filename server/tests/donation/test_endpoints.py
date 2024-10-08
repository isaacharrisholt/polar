import pytest
from httpx import AsyncClient

from polar.models import User
from polar.models.issue import Issue
from polar.models.organization import Organization
from polar.models.user_organization import UserOrganization
from tests.donation.conftest import DonationSender
from tests.fixtures.database import SaveFixture


@pytest.mark.asyncio
@pytest.mark.http_auto_expunge
class TestSearch:
    async def test_unauthenticated(
        self,
        client: AsyncClient,
        organization: Organization,
    ) -> None:
        params = {"to_organization_id": str(organization.id)}
        response = await client.get("/v1/donations/search", params=params)
        assert response.status_code == 401

    @pytest.mark.auth
    async def test_authenticated_not_member(
        self,
        client: AsyncClient,
        organization: Organization,
    ) -> None:
        params = {"to_organization_id": str(organization.id)}
        response = await client.get("/v1/donations/search", params=params)
        assert response.status_code == 401

    @pytest.mark.auth
    async def test_authenticated(
        self,
        client: AsyncClient,
        organization: Organization,
        user_organization: UserOrganization,
    ) -> None:
        params = {"to_organization_id": str(organization.id)}
        response = await client.get("/v1/donations/search", params=params)

        assert response.status_code == 200
        json = response.json()

        assert {"items": [], "pagination": {"total_count": 0, "max_page": 0}} == json

    @pytest.mark.auth
    async def test_with_data(
        self,
        client: AsyncClient,
        organization: Organization,
        user: User,
        user_second: User,
        user_organization: UserOrganization,
        save_fixture: SaveFixture,
        donation_sender: DonationSender,
    ) -> None:
        # 3 donations
        for x in range(3):
            await donation_sender.send_payment_intent_then_charge(
                payment_intent_id=f"pi_{x}",
                latest_charge=f"py_{x}",
                balance_transaction_id=f"bal_{x}",
            )

        # donation from user
        await donation_sender.send_payment_intent_then_charge(
            payment_intent_id="pi_user",
            latest_charge="py_user",
            balance_transaction_id="bal_user",
            by_user_id=user.id,
        )

        # donation from user without avatar
        user_second.avatar_url = None
        await save_fixture(user_second)
        await donation_sender.send_payment_intent_then_charge(
            payment_intent_id="pi_user_second",
            latest_charge="py_user_second",
            balance_transaction_id="bal_user_second",
            by_user_id=user_second.id,
        )

        params = {"to_organization_id": str(organization.id)}
        response = await client.get("/v1/donations/search", params=params)

        assert response.status_code == 200
        json = response.json()

        # order by desc

        assert 5 == len(json["items"])

        # user without avatar
        assert json["items"][0]["donor"]
        assert json["items"][0]["donor"]["public_name"]
        assert json["items"][0]["donor"]["avatar_url"] is None

        # user with avatar
        assert json["items"][1]["donor"]
        assert json["items"][1]["donor"]["public_name"]
        assert json["items"][1]["donor"]["avatar_url"]

        # anonymous
        assert json["items"][2]["donor"] is None

    @pytest.mark.auth
    async def test_with_issue(
        self,
        client: AsyncClient,
        organization: Organization,
        user_organization: UserOrganization,
        donation_sender: DonationSender,
        issue: Issue,
    ) -> None:
        await donation_sender.send_payment_intent_then_charge(
            issue_id=issue.id,
        )

        params = {"to_organization_id": str(organization.id)}
        response = await client.get("/v1/donations/search", params=params)

        assert response.status_code == 200
        json = response.json()

        assert 1 == len(json["items"])
        assert str(issue.id) == json["items"][0]["issue"]["id"]

    async def test_public_search(
        self,
        client: AsyncClient,
        organization: Organization,
        donation_sender: DonationSender,
        user: User,
        user_second: User,
        save_fixture: SaveFixture,
    ) -> None:
        # 3 donations
        for x in range(3):
            await donation_sender.send_payment_intent_then_charge(
                payment_intent_id=f"pi_{x}",
                latest_charge=f"py_{x}",
                balance_transaction_id=f"bal_{x}",
            )

        # donation from user
        await donation_sender.send_payment_intent_then_charge(
            payment_intent_id="pi_user",
            latest_charge="py_user",
            balance_transaction_id="bal_user",
            by_user_id=user.id,
        )

        # donation from user without avatar
        user_second.avatar_url = None
        await save_fixture(user_second)
        await donation_sender.send_payment_intent_then_charge(
            payment_intent_id="pi_user_second",
            latest_charge="py_user_second",
            balance_transaction_id="bal_user_second",
            by_user_id=user_second.id,
        )

        response = await client.get(
            "/v1/donations/public/search",
            params={"organization_id": str(organization.id)},
        )

        assert response.status_code == 200
        json = response.json()

        # order by desc

        assert 5 == len(json["items"])

        # user without avatar
        assert (
            "email" not in (json["items"][0])
        )  # email should not be publicly available
        assert json["items"][0]["donor"]
        assert json["items"][0]["donor"]["public_name"]
        assert json["items"][0]["donor"]["avatar_url"] is None

        # user with avatar
        assert (
            "email" not in (json["items"][1])
        )  # email should not be publicly available
        assert json["items"][1]["donor"]
        assert json["items"][1]["donor"]["public_name"]
        assert json["items"][1]["donor"]["avatar_url"]

        # anonymous
        assert (
            "email" not in (json["items"][2])
        )  # email should not be publicly available
        assert json["items"][2]["donor"] is None
