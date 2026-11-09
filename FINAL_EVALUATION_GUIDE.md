# Member 5 - Rider & Delivery Management - final evaluation handoff

## Responsibility and source files

This pack contains the relevant files from the Foodie baseline and shared context for comparison, plus a `ready-to-commit/` folder containing your module's OOP constructors, `toString()` information hiding, and unit tests ready for you to commit on `feature/delivery-management`.

**Java count:** 10 assigned Java files per the agreed team division. Shared policy/portal infrastructure classes are dependencies, not exclusive files.

**Primary Java classes:** Delivery, DeliveryRepository, DeliveryController, DeliveryService, DriverController, DriverService, Document, DocumentRepository, VehicleChange, VehicleChangeRepository.

**Related frontend:** Merchant DeliveryPage.jsx; Customer OrderTracking.jsx/css and orderTrackingService.js; Driver portal App.jsx/css.

## Minimum CRUD evidence

Create: DeliveryController POST /api/deliveries/accept/{orderId}, DriverController POST /api/driver/orders/{id}/accept, and POST /api/driver/profile/vehicle-change-requests. Read: GET /api/deliveries/available, GET /api/driver/orders/offer, GET /api/driver/orders/active, GET /api/driver/earnings. Update: PUT /api/driver/availability, POST /api/driver/orders/{id}/pickup, POST /api/driver/orders/{id}/complete. Delete/Reject: POST /api/driver/orders/{id}/reject. Show at least two CRUD types (or all four: Create, Read, Update, Delete) during your live demonstration.

Find assigned classes under `Foodie-delivery-management/module-files/backend/src/main/java/...` or, for shared classes, `Foodie-delivery-management/shared-context/backend/src/main/java/...`.

## OOP concepts to explain accurately (40 Marks)

Delivery, Document, and VehicleChange extend DomainEntity; RiderUser extends abstract AppUser and overrides getRole() and requiresApproval(). Document.content (@JsonIgnore @Lob byte[]) hides binary document bytes from JSON serialization. DeliveryService and DriverService encapsulate pessimistic order locking so two drivers cannot accept the same delivery simultaneously.

## Relationships to show in the class diagram (5 Marks)

Delivery, Document, and VehicleChange inherit from DomainEntity; RiderUser inherits from AppUser. Delivery.orderId links to FoodOrder and Delivery.riderId links to RiderUser; Document.userId and VehicleChange.userId link to AppUser. DriverController/DeliveryController -> DriverService/DeliveryService -> repositories.

For the team diagram, use a solid hollow-triangle arrow for inheritance (`DomainEntity` / `AppUser`), solid line labeled with `...Id` for ID-backed domain associations, and dashed arrows for `Controller -> Service -> Repository` dependencies.

## Database / file-storage explanation (10 Marks)

Trace driver availability, offer polling, and delivery acceptance/completion from Driver App.jsx -> DriverController/DeliveryController -> DriverService/DeliveryService -> DeliveryRepository (tables nf_deliveries, nf_documents, nf_vehicle_changes).

Foodie uses SQL persistence through Spring Data JPA/MySQL (Aiven MySQL in production, H2 in automated tests). Never put Aiven credentials in GitHub or screenshots.

## How to record your Individual GitHub Commit History (5 Marks)

Inside this ZIP, `Foodie-delivery-management/module-files/` contains **only your module's files** (backend Java files with overloaded OOP constructors & `@Override toString()`, `DeliveryModuleOopTest.java`, and your module's frontend React files).

1. Extract this ZIP file (for example to `C:\Projects\Foodie-Member-05-Delivery-Management`).
2. Open PowerShell inside the cloned repository (`C:\Projects\Foodie-GitHub`) and push your isolated module branch:
   ```powershell
   cd C:\Projects\Foodie-GitHub
   git checkout main
   git reset --hard origin/main
   git branch -D feature/delivery-management
   git checkout --orphan feature/delivery-management
   git rm -rf backend docs frontend README.md
   Copy-Item -Path "C:\Projects\Foodie-Member-05-Delivery-Management\Foodie-delivery-management\module-files\*" -Destination "C:\Projects\Foodie-GitHub" -Recurse -Force
   Copy-Item -Path "C:\Projects\Foodie-Member-05-Delivery-Management\Foodie-Member-05-Delivery-Management\FINAL_EVALUATION_GUIDE.md" -Destination "C:\Projects\Foodie-GitHub" -Force
   git add .gitignore FINAL_EVALUATION_GUIDE.md backend/src
   if (Test-Path "frontend") { git add frontend }
   git commit -m "Improve delivery and driver constructors, readability and OOP tests"
   git push -f origin feature/delivery-management
   git checkout main
   ```
3. Now your branch `feature/delivery-management` on GitHub will show **only your module's files** committed under **your own GitHub account** (while `main` and `develop` keep the full integrated project). Do **not** merge `feature/delivery-management` into `develop` or `main` so `develop` and `main` keep all modules intact.

## Seven-minute presentation plan (10 Marks)

1. State the user problem and your module responsibility (Member 5 - Rider & Delivery Management).
2. Show one existing UI action and identify its backend endpoint/controller.
3. Follow the request into the service rule, repository, and persisted model.
4. Demonstrate at least two CRUD operation types and refresh/read persisted data.
5. Explain your encapsulation/information-hiding example, overloaded constructor, inheritance from `DomainEntity`/`AppUser`, and one genuine relationship from your code.
6. Show your own GitHub feature-branch commits (`feature/delivery-management`) and pull request.
7. State one limit or external service that is not configured instead of presenting it as working.

**Member:** ____________________  **Feature branch:** `feature/delivery-management`  **Reviewer:** ____________________

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
