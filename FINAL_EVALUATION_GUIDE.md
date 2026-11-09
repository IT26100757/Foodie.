# Member 6 - Reviews & Admin Operations - final evaluation handoff

## Responsibility and source files

This pack contains the relevant files from the Foodie baseline and shared context for comparison, plus a `ready-to-commit/` folder containing your module's OOP constructors, `toString()` information hiding, and unit tests ready for you to commit on `feature/review-management`.

**Java count:** 14 assigned Java files per the agreed team division. Shared policy/portal infrastructure classes are dependencies, not exclusive files.

**Primary Java classes:** Review, ReviewController, ReviewRepository, ReviewService, AdminController, OperationsController, OperationsService, Complaint, ComplaintRepository, Offer, OfferRepository, Notification, NotificationRepository, NotificationService.

**Related frontend:** Customer RestaurantExperience.jsx/css (review form & ratings); Admin App.jsx/adminApi.js (dashboard, approvals, offers, complaints, notifications).

## Minimum CRUD evidence

Create: ReviewController POST /api/reviews, OperationsController POST /api/offers and POST /api/complaints. Read: GET /api/reviews/restaurant/{id}, GET /api/reviews/mine, GET /api/offers, GET /api/notifications. Update: PUT /api/reviews/{id}, PUT /api/offers/{id}, POST /api/admin/complaints/{id}/reply. Delete: DELETE /api/reviews/{id} and DELETE /api/offers/{id}. Show at least two CRUD types (or all four: Create, Read, Update, Delete) during your live demonstration.

Find assigned classes under `Foodie-review-management/module-files/backend/src/main/java/...` or, for shared classes, `Foodie-review-management/shared-context/backend/src/main/java/...`.

## OOP concepts to explain accurately (40 Marks)

Review, Offer, Complaint, and Notification extend DomainEntity and encapsulate domain state with private fields and validated getters/setters. ReviewService enforces completed-order ownership (only DELIVERED or PICKED_UP orders owned by the customer can be reviewed, rating 1-5, one review per order) and hides moderating flags from unauthorized edits.

## Relationships to show in the class diagram (5 Marks)

Review, Offer, Complaint, and Notification inherit from DomainEntity. Review.orderId, customerId, and restaurantId link reviews to orders, customers, and restaurants; Offer.restaurantId and menuItemId link promotional offers. ReviewController/OperationsController/AdminController -> ReviewService/OperationsService/NotificationService -> repositories.

For the team diagram, use a solid hollow-triangle arrow for inheritance (`DomainEntity` / `AppUser`), solid line labeled with `...Id` for ID-backed domain associations, and dashed arrows for `Controller -> Service -> Repository` dependencies.

## Database / file-storage explanation (10 Marks)

Trace submitting, updating, and deleting a review on a completed order from Customer RestaurantExperience.jsx -> ReviewController -> ReviewService -> ReviewRepository (tables nf_reviews, nf_offers, nf_complaints, nf_notifications).

Foodie uses SQL persistence through Spring Data JPA/MySQL (Aiven MySQL in production, H2 in automated tests). Never put Aiven credentials in GitHub or screenshots.

## How to record your Individual GitHub Commit History (5 Marks)

Inside this ZIP, `Foodie-review-management/module-files/` contains **only your module's files** (backend Java files with overloaded OOP constructors & `@Override toString()`, `ReviewModuleOopTest.java`, and your module's frontend React files).

1. Extract this ZIP file (for example to `C:\Projects\Foodie-Member-06-Review-Management`).
2. Open PowerShell inside the cloned repository (`C:\Projects\Foodie-GitHub`) and push your isolated module branch:
   ```powershell
   cd C:\Projects\Foodie-GitHub
   git checkout main
   git reset --hard origin/main
   git branch -D feature/review-management
   git checkout --orphan feature/review-management
   git rm -rf backend docs frontend README.md
   Copy-Item -Path "C:\Projects\Foodie-Member-06-Review-Management\Foodie-review-management\module-files\*" -Destination "C:\Projects\Foodie-GitHub" -Recurse -Force
   Copy-Item -Path "C:\Projects\Foodie-Member-06-Review-Management\Foodie-Member-06-Review-Management\FINAL_EVALUATION_GUIDE.md" -Destination "C:\Projects\Foodie-GitHub" -Force
   git add .gitignore FINAL_EVALUATION_GUIDE.md backend/src
   if (Test-Path "frontend") { git add frontend }
   git commit -m "Improve review and operations constructors, readability and OOP tests"
   git push -f origin feature/review-management
   git checkout main
   ```
3. Now your branch `feature/review-management` on GitHub will show **only your module's files** committed under **your own GitHub account** (while `main` and `develop` keep the full integrated project). Do **not** merge `feature/review-management` into `develop` or `main` so `develop` and `main` keep all modules intact.

## Seven-minute presentation plan (10 Marks)

1. State the user problem and your module responsibility (Member 6 - Reviews & Admin Operations).
2. Show one existing UI action and identify its backend endpoint/controller.
3. Follow the request into the service rule, repository, and persisted model.
4. Demonstrate at least two CRUD operation types and refresh/read persisted data.
5. Explain your encapsulation/information-hiding example, overloaded constructor, inheritance from `DomainEntity`/`AppUser`, and one genuine relationship from your code.
6. Show your own GitHub feature-branch commits (`feature/review-management`) and pull request.
7. State one limit or external service that is not configured instead of presenting it as working.

**Member:** ____________________  **Feature branch:** `feature/review-management`  **Reviewer:** ____________________

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
