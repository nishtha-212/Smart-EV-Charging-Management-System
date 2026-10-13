# Smart EV Charging Station Management System (Frontend)

Plain HTML, CSS and JavaScript. No install or build step is needed.

## Run in VS Code
1. Unzip, then in VS Code choose File > Open Folder and select `ev-charging-management`.
2. Open the Extensions panel (Ctrl+Shift+X), search for **Live Server** (by Ritwick Dey) and install it.
3. Right-click `index.html` and choose **Open with Live Server**.

You can also double-click `index.html` to open it in a browser.

## Project structure
```
index.html                 opens the home page for the current demo role
dashboard.html             1. Dashboard (EV driver)
stations.html              2. Find Charging Stations
station-details.html       3. Station Details
book.html                  4. Book a Charging Slot
my-bookings.html           5. My Bookings
session.html               6. Charging Session Monitoring (simulated)
history.html               7. Charging History
profile.html               8. User Profile and Settings
operator-dashboard.html    9. Station Operator Dashboard
manage.html                10. Station and Charger Management
admin-dashboard.html       11. Admin Dashboard
css/base.css               theme colours (dark/light), reset, typography
css/layout.css             sidebar, top bar, page container, mobile layout
css/components.css         buttons, forms, cards, tables, badges, dialogs
js/common.js               shared helpers, sample data, navigation, theme
js/pages/*.js              one script per page (same name as the HTML file)
```

## Notes
- All data is sample data kept in the browser tab (sessionStorage) so it is shared between pages. It resets when the tab is closed. No backend is connected.
- The charging session is simulated and does not control a physical charger. No real payments are processed.
- Use the "Demo role" dropdown in the top bar to switch between EV Driver, Station Operator and Admin.
- Fonts load from Google Fonts and need an internet connection; a fallback font is used offline.
