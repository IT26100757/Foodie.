# Member 1 - User & Customer Management - final evaluation handoff

## Responsibility and source files

This pack contains the relevant files from the Foodie baseline and shared context for comparison, plus a `ready-to-commit/` folder containing your module's OOP constructors, `toString()` information hiding, and unit tests ready for you to commit on `feature/user-management`.

**Java count:** 14 assigned Java files per the agreed team division. Shared policy/portal infrastructure classes are dependencies, not exclusive files.

**Primary Java classes:** AppUser, CustomerUser, MerchantUser, RiderUser, AdminUser, AppUserRepository, UserService, AuthController, ApplicationController, CustomerController, CustomerService, Favorite, FavoriteRepository, AdminSetup.

**Related frontend:** Customer AccountCenter.jsx/css; authentication, onboarding, and profile sections in Customer/Merchant/Driver/Admin App.jsx.

## Minimum CRUD evidence

Create: AuthController POST /api/auth/register/{role} or CustomerController PUT /api/customer/favorites/{restaurantId}. Read: AuthController GET /api/account and CustomerController GET /api/customer/favorites. Update: AuthController PATCH /api/account/profile and password/approval endpoints. Delete: CustomerController DELETE /api/customer/favorites/{restaurantId}. Show at least two CRUD types (or all four: Create, Read, Update, Delete) during your live demonstration.

Find assigned classes under `Foodie-user-management/module-files/backend/src/main/java/...` or, for shared classes, `Foodie-user-management/shared-context/backend/src/main/java/...`.

## OOP concepts to explain accurately (40 Marks)

AppUser is an abstract superclass extending DomainEntity with single-table JPA inheritance (@Inheritance(strategy = InheritanceType.SINGLE_TABLE)). CustomerUser, MerchantUser, RiderUser, and AdminUser override getRole() and requiresApproval() polymorphically; AppUser.canOperate() uses template-style delegation to requiresApproval(). Sensitive fields (passwordHash, verificationHash, pendingEmailHash) use private encapsulation and @JsonIgnore information hiding.

## Relationships to show in the class diagram (5 Marks)

CustomerUser, MerchantUser, RiderUser, and AdminUser inherit from abstract AppUser, which inherits from abstract DomainEntity. Favorite.userId and restaurantId are ID-based domain associations; AuthController and CustomerController depend on UserService and CustomerService.

For the team diagram, use a solid hollow-triangle arrow for inheritance (`DomainEntity` / `AppUser`), solid line labeled with `...Id` for ID-backed domain associations, and dashed arrows for `Controller -> Service -> Repository` dependencies.

## Database / file-storage explanation (10 Marks)

Trace customer registration or favorite toggle from AccountCenter/HomePage -> AuthController/CustomerController -> UserService/CustomerService -> AppUserRepository/FavoriteRepository (tables nf_users, nf_favorites). Explain BCrypt password hashing and session persistence.

Foodie uses SQL persistence through Spring Data JPA/MySQL (Aiven MySQL in production, H2 in automated tests). Never put Aiven credentials in GitHub or screenshots.

## How to record your Individual GitHub Commit History (5 Marks)

Inside this ZIP, `Foodie-user-management/module-files/` contains **only your module's files** (backend Java files with overloaded OOP constructors & `@Override toString()`, `UserModuleOopTest.java`, and your module's frontend React files).

1. Extract this ZIP file (for example to `C:\Projects\Foodie-Member-01-User-Management`).
2. Open PowerShell inside the cloned repository (`C:\Projects\Foodie-GitHub`) and push your isolated module branch:
   ```powershell
   cd C:\Projects\Foodie-GitHub
   git checkout main
   git reset --hard origin/main
   git branch -D feature/user-management
   git checkout --orphan feature/user-management
   git rm -rf backend docs frontend README.md
   Copy-Item -Path "C:\Projects\Foodie-Member-01-User-Management\Foodie-user-management\module-files\*" -Destination "C:\Projects\Foodie-GitHub" -Recurse -Force
   Copy-Item -Path "C:\Projects\Foodie-Member-01-User-Management\Foodie-Member-01-User-Management\FINAL_EVALUATION_GUIDE.md" -Destination "C:\Projects\Foodie-GitHub" -Force
   git add .gitignore FINAL_EVALUATION_GUIDE.md backend/src
   if (Test-Path "frontend") { git add frontend }
   git commit -m "Improve user management constructors, readability and OOP tests"
   git push -f origin feature/user-management
   git checkout main
   ```
3. Now your branch `feature/user-management` on GitHub will show **only your module's files** committed under **your own GitHub account** (while `main` and `develop` keep the full integrated project). Do **not** merge `feature/user-management` into `develop` or `main` so `develop` and `main` keep all modules intact.

## Seven-minute presentation plan (10 Marks)

1. State the user problem and your module responsibility (Member 1 - User & Customer Management).
2. Show one existing UI action and identify its backend endpoint/controller.
3. Follow the request into the service rule, repository, and persisted model.
4. Demonstrate at least two CRUD operation types and refresh/read persisted data.
5. Explain your encapsulation/information-hiding example, overloaded constructor, inheritance from `DomainEntity`/`AppUser`, and one genuine relationship from your code.
6. Show your own GitHub feature-branch commits (`feature/user-management`) and pull request.
7. State one limit or external service that is not configured instead of presenting it as working.

**Member:** ____________________  **Feature branch:** `feature/user-management`  **Reviewer:** ____________________

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
