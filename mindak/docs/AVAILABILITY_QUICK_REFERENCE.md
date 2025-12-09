# Availability Management - Quick Reference Guide

## Accessing Availability Settings

Navigate to: **Dashboard → Podcast Orders → Availability Tab**

## Three Main Sections

### 1. Calendar Tab
- View and manage existing reservations
- Drag-and-drop to reschedule
- Toggle between Confirmed and Pending views
- Create new reservations

### 2. Availability Tab
- Configure business hours
- Set booking constraints
- Save configuration changes

### 3. Preview Tab
- See how configuration affects available slots
- Select date and package to preview
- View available vs. booked slots

## Quick Actions

### Set Business Hours

1. Click **Availability** tab
2. Toggle day switches to enable/disable days
3. Set start and end times for each day
4. Click **Save Changes**

**Example:**
- Monday-Friday: 09:00 - 18:00
- Saturday: 10:00 - 16:00
- Sunday: Closed (toggle off)

### Configure Booking Rules

1. Click **Availability** tab
2. Click **Booking Constraints** sub-tab
3. Update:
   - **Timezone**: Europe/Paris
   - **Slot Duration**: 60 minutes
   - **Advance Booking**: 90 days
   - **Minimum Notice**: 2 days
4. Click **Save Changes**

### Preview Availability

1. Click **Preview** tab
2. Select a **Package** from dropdown
3. Select a **Date** from calendar
4. View available (green) and booked (red) slots

## Important Rules

### Time Constraints
- ✅ All times must be on the hour (09:00, 10:00, etc.)
- ✅ Durations must be whole hours (1h, 2h, 3h)
- ❌ No half-hour slots (09:30 is invalid)
- ❌ No fractional durations (1.5h is invalid)

### Business Hours
- Start time must be before end time
- Times in 24-hour format (HH:mm)
- Days can be completely closed (toggle off)

### Booking Constraints
- **Slot Duration**: Typically 60 minutes
- **Advance Booking**: How far ahead clients can book (e.g., 90 days)
- **Minimum Notice**: Days required before booking (e.g., 2 days)

## Common Scenarios

### Scenario 1: Close Studio on Specific Day
1. Go to Availability → Business Hours
2. Find the day (e.g., Sunday)
3. Toggle the switch to OFF
4. Save changes

### Scenario 2: Change Operating Hours
1. Go to Availability → Business Hours
2. Find the day to modify
3. Update start/end times
4. Save changes

### Scenario 3: Check Availability for Specific Date
1. Go to Preview tab
2. Select package (e.g., "Premium Recording - 2h")
3. Click on desired date in calendar
4. View available slots

### Scenario 4: Extend Booking Window
1. Go to Availability → Booking Constraints
2. Update "Maximum Advance Booking" (e.g., from 90 to 120 days)
3. Save changes

## Visual Indicators

### Availability Preview
- 🟢 **Green Slots**: Available for booking
- 🔴 **Red Slots**: Already booked or unavailable
- **Numbers**: Count of available/booked/total slots

### Unsaved Changes
- ⚠️ **Yellow Alert**: Appears when you have unsaved changes
- Reminder to save before leaving the page

## Tips & Best Practices

1. **Always Save**: Click "Save Changes" after modifying configuration
2. **Preview First**: Use Preview tab to check effects before finalizing
3. **Consistent Hours**: Keep similar hours for weekdays for easier client planning
4. **Reasonable Notice**: Set minimum notice to allow preparation time
5. **Check Conflicts**: Before changing hours, check existing reservations in Calendar tab

## Troubleshooting

### Changes Not Appearing
- ✅ Ensure you clicked "Save Changes"
- ✅ Refresh the page
- ✅ Check browser console for errors

### Slots Not Showing in Preview
- ✅ Verify business hours are set for selected day
- ✅ Check if selected package duration fits within business hours
- ✅ Ensure date is within advance booking window

### Cannot Save Configuration
- ✅ Check all time fields are valid (HH:mm format)
- ✅ Ensure start times are before end times
- ✅ Verify you have admin permissions

## Keyboard Shortcuts

- **Tab**: Navigate between fields
- **Enter**: Save changes (when focused on Save button)
- **Esc**: Close modals/dialogs

## API Endpoints (For Developers)

- `GET /api/v1/admin/podcast/configuration/availability` - Get config
- `PUT /api/v1/admin/podcast/configuration/availability` - Update config
- `GET /api/v1/client/podcast/availability?date={date}&packOfferId={id}` - Preview

## Support

For technical issues or questions:
1. Check the full documentation: `docs/AVAILABILITY_IMPLEMENTATION.md`
2. Review API specification: `docs/ADMIN_FRONTEND_API_SPEC.md`
3. Contact development team

---

**Last Updated**: 2025-11-22
**Version**: 1.0
