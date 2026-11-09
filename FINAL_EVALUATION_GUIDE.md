# Member 2 - Restaurant & Menu Management - final evaluation handoff

## Responsibility and source files

This pack contains the relevant files from the Foodie baseline and shared context for comparison, plus a `ready-to-commit/` folder containing your module's OOP constructors, `toString()` information hiding, and unit tests ready for you to commit on `feature/restaurant-menu-management`.

**Java count:** 9 assigned Java files per the agreed team division. Shared policy/portal infrastructure classes are dependencies, not exclusive files.

**Primary Java classes:** Restaurant, MenuItem, MenuSize, RestaurantRepository, MenuItemRepository, MenuSizeRepository, RestaurantController, RestaurantService, CloudinaryImages.

**Related frontend:** Merchant MenuPage.jsx; Customer OffersPage.jsx/css and offersData.js; shared Customer RestaurantExperience.jsx/HomePage.jsx and Admin restaurant views.

## Minimum CRUD evidence

Create: RestaurantController POST /api/restaurants and POST /api/menu-items. Read: GET /api/restaurants (with location/type filters) and GET /api/menu-items?restaurantId=.... Update: PUT /api/restaurants/{id}, PUT /api/menu-items/{id}, and POST /api/menu-items/{clientId}. Delete: DELETE /api/restaurants/{id} and DELETE /api/menu-items/{id} (soft archive). Show at least two CRUD types (or all four: Create, Read, Update, Delete) during your live demonstration.

Find assigned classes under `Foodie-restaurant-menu-management/module-files/backend/src/main/java/...` or, for shared classes, `Foodie-restaurant-menu-management/shared-context/backend/src/main/java/...`.

## OOP concepts to explain accurately (40 Marks)

Restaurant, MenuItem, and MenuSize extend DomainEntity and encapsulate catalog state, pricing, and Cloudinary references with private fields and public accessors. RestaurantService enforces merchant ownership (own()) and input validation before delegating persistence to Spring Data repository interfaces. CloudinaryImages encapsulates image storage behind an immutable ImageReference record.

## Relationships to show in the class diagram (5 Marks)

Restaurant, MenuItem, and MenuSize inherit from DomainEntity. MenuItem.restaurantId links items to Restaurant; MenuSize.itemId links size options to MenuItem. RestaurantController -> RestaurantService -> RestaurantRepository/MenuItemRepository/MenuSizeRepository/CloudinaryImages.

For the team diagram, use a solid hollow-triangle arrow for inheritance (`DomainEntity` / `AppUser`), solid line labeled with `...Id` for ID-backed domain associations, and dashed arrows for `Controller -> Service -> Repository` dependencies.

## Database / file-storage explanation (10 Marks)

Trace creating or updating a menu item from Merchant MenuPage.jsx -> RestaurantController -> RestaurantService -> MenuItemRepository/MenuSizeRepository (tables nf_restaurants, nf_menu_items, nf_menu_sizes). Explain how browser alias IDs map to database-generated primary keys.

Foodie uses SQL persistence through Spring Data JPA/MySQL (Aiven MySQL in production, H2 in automated tests). Never put Aiven credentials in GitHub or screenshots.

## How to record your Individual GitHub Commit History (5 Marks)

Inside this ZIP, `Foodie-restaurant-menu-management/module-files/` contains **only your module's files** (backend Java files with overloaded OOP constructors & `@Override toString()`, `RestaurantModuleOopTest.java`, and your module's frontend React files).

1. Extract this ZIP file (for example to `C:\Projects\Foodie-Member-02-Restaurant-Menu-Management`).
2. Open PowerShell inside the cloned repository (`C:\Projects\Foodie-GitHub`) and push your isolated module branch:
   ```powershell
   cd C:\Projects\Foodie-GitHub
   git checkout main
   git reset --hard origin/main
   git branch -D feature/restaurant-menu-management
   git checkout --orphan feature/restaurant-menu-management
   git rm -rf backend docs frontend README.md
   Copy-Item -Path "C:\Projects\Foodie-Member-02-Restaurant-Menu-Management\Foodie-restaurant-menu-management\module-files\*" -Destination "C:\Projects\Foodie-GitHub" -Recurse -Force
   Copy-Item -Path "C:\Projects\Foodie-Member-02-Restaurant-Menu-Management\Foodie-Member-02-Restaurant-Menu-Management\FINAL_EVALUATION_GUIDE.md" -Destination "C:\Projects\Foodie-GitHub" -Force
   git add .gitignore FINAL_EVALUATION_GUIDE.md backend/src
   if (Test-Path "frontend") { git add frontend }
   git commit -m "Improve restaurant and menu constructors, readability and OOP tests"
   git push -f origin feature/restaurant-menu-management
   git checkout main
   ```
3. Now your branch `feature/restaurant-menu-management` on GitHub will show **only your module's files** committed under **your own GitHub account** (while `main` and `develop` keep the full integrated project). Do **not** merge `feature/restaurant-menu-management` into `develop` or `main` so `develop` and `main` keep all modules intact.

## Seven-minute presentation plan (10 Marks)

1. State the user problem and your module responsibility (Member 2 - Restaurant & Menu Management).
2. Show one existing UI action and identify its backend endpoint/controller.
3. Follow the request into the service rule, repository, and persisted model.
4. Demonstrate at least two CRUD operation types and refresh/read persisted data.
5. Explain your encapsulation/information-hiding example, overloaded constructor, inheritance from `DomainEntity`/`AppUser`, and one genuine relationship from your code.
6. Show your own GitHub feature-branch commits (`feature/restaurant-menu-management`) and pull request.
7. State one limit or external service that is not configured instead of presenting it as working.

**Member:** ____________________  **Feature branch:** `feature/restaurant-menu-management`  **Reviewer:** ____________________

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
