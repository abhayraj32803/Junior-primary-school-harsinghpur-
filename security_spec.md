# Security Specification: Composite JHS Harsinghpur Gova School Portal

## 1. Core Data Invariants & Zero-Trust Policies
- **User Profile Protection**: An unauthorized user must NEVER be able to read, query, or mutate another user's profile document (`/users/{userId}`). Access is restricted to `request.auth.uid == userId` or verified admins (`ngoaarya159@gmail.com`, `admin@school.gov.in`, or admin role in DB).
- **Self-Role-Escalation Prevention**: Regular users cannot change their own `role`, `status`, or `isApproved` values during updates.
- **Student Record Isolation**: A student's official admission and academic record (`/students/{studentId}`) contains sensitive personal details (parents, phone, address). It MUST NEVER be readable by arbitrary authenticated users or anonymous callers. Access is strictly granted to:
  1. The student themselves (`resource.data.userId == request.auth.uid` or matching student admission number in user profile).
  2. School administration (`isAdmin()`).
  3. Assigned teachers / verified faculty (`isTeacher()`).
- **Student Record Write Isolation**: Student creation and deletion are restricted to authorized admins. Updates can only be performed by admins or authorized teachers.
- **Tamper-Proof Audit Logs**: `/auditLogs/{logId}` can only be created by signed-in users and is strictly immutable (updates and deletes are forbidden `allow update, delete: if false;`).
- **Global Default-Deny**: The catch-all rule `match /{document=**} { allow read, write: if false; }` ensures no unspecified collection is exposed.

---

## 2. The "Dirty Dozen" Malicious Payloads

1. **Payload 1 (User PII Snooping)**: Attacker with UID `user-hacker-99` attempts `GET /users/admin-001` or `GET /users/student-001`.
   - *Expected*: `PERMISSION_DENIED`.
2. **Payload 2 (Student Record Data Scraping)**: Attacker with UID `user-anonymous` or non-assigned student `student-002` attempts `GET /students/stu-001` without matching credentials.
   - *Expected*: `PERMISSION_DENIED`.
3. **Payload 3 (Self-Role Escalation)**: Student `user-student-123` attempts `PATCH /users/user-student-123` with `{ role: "admin", status: "active" }`.
   - *Expected*: `PERMISSION_DENIED`.
4. **Payload 4 (Ghost Field Shadow Write)**: User attempts `CREATE /users/user-123` with extra unwhitelisted system flags `{ isSuperAdmin: true }`.
   - *Expected*: `PERMISSION_DENIED`.
5. **Payload 5 (Unassigned Student Document Deletion)**: Attacker attempts `DELETE /students/stu-001`.
   - *Expected*: `PERMISSION_DENIED` (only `isAdmin()` allowed).
6. **Payload 6 (Student Impersonation in Submission)**: Student `user-002` creates homework submission `/submissions/sub-001` with `studentId: "user-003"`.
   - *Expected*: `PERMISSION_DENIED`.
7. **Payload 7 (Audit Log Tampering)**: User attempts `DELETE /auditLogs/log-001` or `UPDATE /auditLogs/log-001`.
   - *Expected*: `PERMISSION_DENIED`.
8. **Payload 8 (Grade Book Forgery)**: Student attempts `POST /marks/mrk-001` setting their own score to 100%.
   - *Expected*: `PERMISSION_DENIED` (only `isTeacher()` or `isAdmin()` allowed).
9. **Payload 9 (ID Poisoning Attack)**: Attacker sends document ID with 500 junk characters `GET /students/%%%$$$LONG_POISON...`.
   - *Expected*: `PERMISSION_DENIED` via `isValidId()`.
10. **Payload 10 (Attendance Spoofing)**: Student attempts `POST /attendance/att-001` to mark themselves present.
    - *Expected*: `PERMISSION_DENIED` (only `isTeacher()` allowed).
11. **Payload 11 (Notice Defacement)**: Unauthorized student attempts `POST /notices/not-fake` or `DELETE /notices/not-001`.
    - *Expected*: `PERMISSION_DENIED`.
12. **Payload 12 (Settings Tampering)**: Non-admin attempts `PUT /settings/config` to alter school UDISE or grading scale.
    - *Expected*: `PERMISSION_DENIED`.
