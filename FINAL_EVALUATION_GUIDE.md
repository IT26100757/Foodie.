# Member 3 - Order Management - final evaluation handoff

## Responsibility and source files

This pack contains the relevant files from the Foodie baseline and shared context for comparison, plus a `ready-to-commit/` folder containing your module's OOP constructors, `toString()` information hiding, and unit tests ready for you to commit on `feature/order-management`.

**Java count:** 7 assigned Java files per the agreed team division. Shared policy/portal infrastructure classes are dependencies, not exclusive files.

**Primary Java classes:** FoodOrder, FoodOrderRepository, OrderLine, OrderLineRepository, OrderController, GuestOrderController, OrderService.

**Related frontend:** Customer CheckoutPage.jsx/css and customerApi.js; Merchant OrdersPage.jsx and merchantApi.js. Shared Customer HomePage/App and Admin order view are coordinated files.

## Minimum CRUD evidence

Create: OrderController POST /api/orders or GuestOrderController POST /api/guest/orders. Read: list/detail/tracking/items endpoints in OrderController, and guest-token protected read in GuestOrderController. Update: permitted order status (PATCH /api/orders/{id}/status) and additional-charge consent/proposal endpoints. Show at least two CRUD types (or all four: Create, Read, Update, Delete) during your live demonstration.

Find assigned classes under `Foodie-order-management/module-files/backend/src/main/java/...` or, for shared classes, `Foodie-order-management/shared-context/backend/src/main/java/...`.

## OOP concepts to explain accurately (40 Marks)

FoodOrder and OrderLine encapsulate stored order and line snapshots and extend DomainEntity. OrderService contains server-side pricing, reward/offer calculation, ownership validation, and state transition rules; controllers delegate to it; repositories abstract persistence and pessimistic locking.

## Relationships to show in the class diagram (5 Marks)

FoodOrder and OrderLine inherit from DomainEntity. FoodOrder.customerId and restaurantId link the order; OrderLine.orderId and menuItemId link its lines. OrderController and GuestOrderController -> OrderService -> FoodOrderRepository/OrderLineRepository.

For the team diagram, use a solid hollow-triangle arrow for inheritance (`DomainEntity` / `AppUser`), solid line labeled with `...Id` for ID-backed domain associations, and dashed arrows for `Controller -> Service -> Repository` dependencies.

## Database / file-storage explanation (10 Marks)

Trace checkout quote/create to server-side price and quantity validation, then order/line persistence (nf_orders, nf_order_lines) and a subsequent read. Explain idempotency keys (Idempotency-Key) and SHA-256 hashed guest access tokens (guestAccessHash hidden with @JsonIgnore).

Foodie uses SQL persistence through Spring Data JPA/MySQL (Aiven MySQL in production, H2 in automated tests). Never put Aiven credentials in GitHub or screenshots.

## How to record your Individual GitHub Commit History (5 Marks)

Inside this ZIP, `Foodie-order-management/module-files/` contains **only your module's files** (backend Java files with overloaded OOP constructors & `@Override toString()`, `OrderModuleOopTest.java`, and your module's frontend React files).

1. Extract this ZIP file (for example to `C:\Projects\Foodie-Member-03-Order-Management`).
2. Open PowerShell inside the cloned repository (`C:\Projects\Foodie-GitHub`) and push your isolated module branch:
   ```powershell
   cd C:\Projects\Foodie-GitHub
   git checkout main
   git reset --hard origin/main
   git branch -D feature/order-management
   git checkout --orphan feature/order-management
   git rm -rf backend docs frontend README.md
   Copy-Item -Path "C:\Projects\Foodie-Member-03-Order-Management\Foodie-order-management\module-files\*" -Destination "C:\Projects\Foodie-GitHub" -Recurse -Force
   Copy-Item -Path "C:\Projects\Foodie-Member-03-Order-Management\Foodie-Member-03-Order-Management\FINAL_EVALUATION_GUIDE.md" -Destination "C:\Projects\Foodie-GitHub" -Force
   git add .gitignore FINAL_EVALUATION_GUIDE.md backend/src
   if (Test-Path "frontend") { git add frontend }
   git commit -m "Improve order management constructors, readability and OOP tests"
   git push -f origin feature/order-management
   git checkout main
   ```
3. Now your branch `feature/order-management` on GitHub will show **only your module's files** committed under **your own GitHub account** (while `main` and `develop` keep the full integrated project). Do **not** merge `feature/order-management` into `develop` or `main` so `develop` and `main` keep all modules intact.

## Seven-minute presentation plan (10 Marks)

1. State the user problem and your module responsibility (Member 3 - Order Management).
2. Show one existing UI action and identify its backend endpoint/controller.
3. Follow the request into the service rule, repository, and persisted model.
4. Demonstrate at least two CRUD operation types and refresh/read persisted data.
5. Explain your encapsulation/information-hiding example, overloaded constructor, inheritance from `DomainEntity`/`AppUser`, and one genuine relationship from your code.
6. Show your own GitHub feature-branch commits (`feature/order-management`) and pull request.
7. State one limit or external service that is not configured instead of presenting it as working.

**Member:** ____________________  **Feature branch:** `feature/order-management`  **Reviewer:** ____________________

## Evaluator checklist

- CRUD operations demonstrated: ______________________________
- OOP example and exact class: _______________________________
- Relationship and field/arrow shown: _________________________
- Database/API flow and evidence: _____________________________
- Genuine commits / pull request reviewed: _____________________
- Peer feedback: ____________________________________________
- Follow-up action: __________________________________________

## Team-wide assessment rubric (100 marks)

Assigned CRUD functionality 10; OOP concepts 40; file handling/database implementation 10; completeness 10; individual contribution/GitHub history 5; presentation/communication 10; class diagrams 5; teamwork/peer review 5; coding standards 5.

See `TEAM_FINAL_EVALUATION_GUIDE.pdf` for the shared branch workflow, meeting agenda, and team diagram overview.
