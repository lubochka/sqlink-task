# Test Report - 2026-02-08 18:10:01

## V4 Improvements
- Internal Keyvault enabled: Passwords loaded via Docker Secrets
- API reads password from /run/secrets/db_password at startup
- Password removed from appsettings.json and API environment variables
- V2/V3 fixes included (Auth, CORS, Swagger XML, Bug fixes)

| Approach | Test | Result | Detail |
|----------|------|--------|--------|
| Approach A - Vanilla | Docker Build | PASS |  |
| Approach A - Vanilla | API Startup | PASS |  |
| Approach A - Vanilla | Create Transaction | PASS | ID=1, Status=CREATED |
| Approach A - Vanilla | Get Transaction | PASS | Status=CREATED |
| Approach A - Vanilla | Available Transitions | PASS | Found: VALIDATED |
| Approach A - Vanilla | Transition to VALIDATED | PASS | Status=VALIDATED |
| Approach A - Vanilla | Transition to PROCESSING | PASS | Status=PROCESSING |
| Approach A - Vanilla | Transition to COMPLETED | PASS | Status=COMPLETED |
| Approach A - Vanilla | Transaction History | PASS | History entries: 3 |
| Approach A - Vanilla | Validation: Bad Input -> 400 | PASS | StatusCode=400 |
| Approach A - Vanilla | Invalid Transition -> 400 | PASS | StatusCode=400 |
| Approach A - Vanilla | Not Found -> 404 | PASS | StatusCode=404 |
| Approach A - Vanilla | Workflow Visualization | PASS | Mermaid graph returned |
| Approach A - Vanilla | Admin: Get Statuses | PASS | Found 5 statuses |
| Approach A - Vanilla | Admin: Get Transitions | PASS | Found 5 transitions |
| Approach B - Multi-Tenant DNA | Docker Build | PASS |  |
| Approach B - Multi-Tenant DNA | API Startup | PASS |  |
| Approach B - Multi-Tenant DNA | Create Transaction | PASS | ID=1, Status=CREATED |
| Approach B - Multi-Tenant DNA | Get Transaction | PASS | Status=CREATED |
| Approach B - Multi-Tenant DNA | Available Transitions | PASS | Found: VALIDATED |
| Approach B - Multi-Tenant DNA | Transition to VALIDATED | PASS | Status=VALIDATED |
| Approach B - Multi-Tenant DNA | Transition to PROCESSING | PASS | Status=PROCESSING |
| Approach B - Multi-Tenant DNA | Transition to COMPLETED | PASS | Status=COMPLETED |
| Approach B - Multi-Tenant DNA | Transaction History | PASS | History entries: 3 |
| Approach B - Multi-Tenant DNA | Validation: Bad Input -> 400 | PASS | StatusCode=400 |
| Approach B - Multi-Tenant DNA | Invalid Transition -> 400 | PASS | StatusCode=400 |
| Approach B - Multi-Tenant DNA | Not Found -> 404 | PASS | StatusCode=404 |
| Approach B - Multi-Tenant DNA | Workflow Visualization | PASS | Mermaid graph returned |
| Approach B - Multi-Tenant DNA | Admin: Get Statuses | PASS | Found 5 statuses |
| Approach B - Multi-Tenant DNA | Admin: Get Transitions | PASS | Found 5 transitions |
| Approach D - Strategic Hybrid | Docker Build | PASS |  |
| Approach D - Strategic Hybrid | API Startup | PASS |  |
| Approach D - Strategic Hybrid | Create Transaction | PASS | ID=1, Status=CREATED |
| Approach D - Strategic Hybrid | Get Transaction | PASS | Status=CREATED |
| Approach D - Strategic Hybrid | Available Transitions | PASS | Found: VALIDATED |
| Approach D - Strategic Hybrid | Transition to VALIDATED | PASS | Status=VALIDATED |
| Approach D - Strategic Hybrid | Transition to PROCESSING | PASS | Status=PROCESSING |
| Approach D - Strategic Hybrid | Transition to COMPLETED | PASS | Status=COMPLETED |
| Approach D - Strategic Hybrid | Transaction History | PASS | History entries: 3 |
| Approach D - Strategic Hybrid | Validation: Bad Input -> 400 | PASS | StatusCode=400 |
| Approach D - Strategic Hybrid | Invalid Transition -> 400 | PASS | StatusCode=400 |
| Approach D - Strategic Hybrid | Not Found -> 404 | PASS | StatusCode=404 |
| Approach D - Strategic Hybrid | Workflow Visualization | PASS | Mermaid graph returned |
| Approach D - Strategic Hybrid | Admin: Get Statuses | PASS | Found 5 statuses |
| Approach D - Strategic Hybrid | Admin: Get Transitions | PASS | Found 5 transitions |

**Total: 45 passed, 0 failed in 1.9 minutes**
