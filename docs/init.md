## Functional Requirements — Daily Task Management

### FR-02: Add Multiple Tasks per Day (P0)

The system shall allow users to add multiple task entries for the same work date.

**Requirements:**
- Each task must contain a work date and task description.
- Users can add multiple tasks to a single date.
- Each task is stored as a separate database record.
- Users can edit or delete each task independently.
- The application displays all saved tasks for the selected date.
- When generating a timesheet, the system includes all eligible tasks recorded for that date.
- The maximum number of tasks per day remains configurable or subject to future confirmation.

### Acceptance Criteria

- Users can create at least two tasks for the same work date.
- Tasks for the same date are displayed together.
- Editing one task does not modify other tasks.
- Deleting one task does not delete other tasks for the same date.
- All eligible tasks for the selected date are included in the generated Excel timesheet.
- The generated Excel file is attached to a Gmail draft, which the user reviews and sends manually.

### Updated Workflow

1. User logs in.
2. User selects a work date.
3. User adds one or more task descriptions.
4. The application saves each task to the database.
5. User reviews the tasks for the selected date.
6. The application generates an Excel timesheet using the existing template.
7. User previews the timesheet and reviews the email details.
8. The application creates a Gmail draft with the Excel file attached.
9. User reviews and sends the email manually.
