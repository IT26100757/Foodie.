# Member 4 - Payment & Wallet Management - final evaluation handoff

## Responsibility and source files

This pack contains the relevant files from the Foodie baseline and shared context for comparison, plus a `ready-to-commit/` folder containing your module's OOP constructors, `toString()` information hiding, and unit tests ready for you to commit on `feature/payment-management`.

**Java count:** 14 assigned Java files per the agreed team division. Shared policy/portal infrastructure classes are dependencies, not exclusive files.

**Primary Java classes:** BankCipher, BankAccount, Payment, Payout, Refund, BankAccountRepository, PaymentRepository, PayoutRepository, RefundRepository, PaymentService, WalletController, BusinessPolicy, BusinessPolicyRepository, BusinessPolicyService.

**Related frontend:** Merchant WalletPage.jsx/css, WalletReports.jsx, walletReportExports.js, transactionAudio.js; shared Admin payments/payouts/refunds and Driver earnings/bank views.

## Minimum CRUD evidence

Create: WalletController POST /api/wallet/bank-accounts, POST /api/wallet/transfers, and POST /api/refunds/{orderId}. Read: GET /api/wallet, GET /api/payments, GET /api/wallet/bank-accounts. Update: PUT /api/wallet/bank-accounts/{id}, POST /api/payments/collect/{orderId}, and Admin payout/refund settlement. Delete: DELETE /api/wallet/bank-accounts/{id}. Show at least two CRUD types (or all four: Create, Read, Update, Delete) during your live demonstration.

Find assigned classes under `Foodie-payment-management/module-files/backend/src/main/java/...` or, for shared classes, `Foodie-payment-management/shared-context/backend/src/main/java/...`.

## OOP concepts to explain accurately (40 Marks)

Payment, BankAccount, Payout, and Refund extend DomainEntity. Information hiding is strongly demonstrated by BankAccount.numberEncrypted (@JsonIgnore) and BankCipher, which encapsulates AES-GCM 128-bit encryption so full bank account numbers are never exposed in JSON responses or logs, while only lastFour is readable.

## Relationships to show in the class diagram (5 Marks)

Payment, BankAccount, Payout, Refund, and BusinessPolicy inherit from DomainEntity. Payment.orderId and Refund.orderId link to FoodOrder; BankAccount.ownerId and Payout.ownerId link to AppUser; Payout.bankAccountId links to BankAccount. WalletController -> PaymentService -> repositories and BankCipher.

For the team diagram, use a solid hollow-triangle arrow for inheritance (`DomainEntity` / `AppUser`), solid line labeled with `...Id` for ID-backed domain associations, and dashed arrows for `Controller -> Service -> Repository` dependencies.

## Database / file-storage explanation (10 Marks)

Trace adding a bank account or collecting cash payment from WalletPage.jsx -> WalletController -> PaymentService -> BankCipher & BankAccountRepository/PaymentRepository (tables nf_bank_accounts, nf_payments, nf_payouts, nf_refunds, nf_business_policies).

Foodie uses SQL persistence through Spring Data JPA/MySQL (Aiven MySQL in production, H2 in automated tests). Never put Aiven credentials in GitHub or screenshots.

## How to record your Individual GitHub Commit History (5 Marks)

Inside this ZIP, `Foodie-payment-management/module-files/` contains **only your module's files** (backend Java files with overloaded OOP constructors & `@Override toString()`, `PaymentModuleOopTest.java`, and your module's frontend React files).

1. Extract this ZIP file (for example to `C:\Projects\Foodie-Member-04-Payment-Management`).
2. Open PowerShell inside the cloned repository (`C:\Projects\Foodie-GitHub`) and push your isolated module branch:
   ```powershell
   cd C:\Projects\Foodie-GitHub
   git checkout main
   git reset --hard origin/main
   git branch -D feature/payment-management
   git checkout --orphan feature/payment-management
   git rm -rf backend docs frontend README.md
   Copy-Item -Path "C:\Projects\Foodie-Member-04-Payment-Management\Foodie-payment-management\module-files\*" -Destination "C:\Projects\Foodie-GitHub" -Recurse -Force
   Copy-Item -Path "C:\Projects\Foodie-Member-04-Payment-Management\Foodie-Member-04-Payment-Management\FINAL_EVALUATION_GUIDE.md" -Destination "C:\Projects\Foodie-GitHub" -Force
   git add .gitignore FINAL_EVALUATION_GUIDE.md backend/src
   if (Test-Path "frontend") { git add frontend }
   git commit -m "Improve payment and wallet constructors, readability and OOP tests"
   git push -f origin feature/payment-management
   git checkout main
   ```
3. Now your branch `feature/payment-management` on GitHub will show **only your module's files** committed under **your own GitHub account** (while `main` and `develop` keep the full integrated project). Do **not** merge `feature/payment-management` into `develop` or `main` so `develop` and `main` keep all modules intact.

## Seven-minute presentation plan (10 Marks)

1. State the user problem and your module responsibility (Member 4 - Payment & Wallet Management).
2. Show one existing UI action and identify its backend endpoint/controller.
3. Follow the request into the service rule, repository, and persisted model.
4. Demonstrate at least two CRUD operation types and refresh/read persisted data.
5. Explain your encapsulation/information-hiding example, overloaded constructor, inheritance from `DomainEntity`/`AppUser`, and one genuine relationship from your code.
6. Show your own GitHub feature-branch commits (`feature/payment-management`) and pull request.
7. State one limit or external service that is not configured instead of presenting it as working.

**Member:** ____________________  **Feature branch:** `feature/payment-management`  **Reviewer:** ____________________

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
