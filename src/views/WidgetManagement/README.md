# Widget Management System - Admin Panel

## 📋 Overview

A complete admin control panel for managing dynamic widgets on your frontend application. Built with CoreUI React components and integrated into your existing admin template.

## 🚀 Features

### Widget Types (12 Total)
- 🎯 **Banner Widget** - Hero images with CTA buttons
- 🎁 **Promotion Widget** - Special offers with terms
- 📢 **Announcement Widget** - Important notifications
- 🎮 **Game Spotlight** - Featured games showcase
- 📝 **Custom HTML** - Custom HTML/CSS/JS content
- 🖼️ **Image Widget** - Simple images with links
- 🎬 **Video Widget** - Embedded videos
- ⏰ **Countdown** - Countdown timers
- 👥 **Social Feed** - Social media integration
- 📊 **Live Stats** - Real-time statistics
- 📰 **News Ticker** - Scrolling news
- 🎭 **Popup Modal** - Modal dialogs

### Core Features
- ✅ **Full CRUD Operations** - Create, Read, Update, Delete
- ✅ **Smart Filtering** - By status, type, position
- ✅ **Status Management** - Quick activate/deactivate
- ✅ **Clone Function** - Duplicate existing widgets
- ✅ **Image Upload** - Built-in upload support
- ✅ **Analytics Dashboard** - Performance tracking
- ✅ **Priority Ordering** - Control display order
- ✅ **Date Scheduling** - Schedule widgets
- ✅ **Page Targeting** - Show on specific pages
- ✅ **User Targeting** - Show to logged in/out users

## 📁 File Structure

```
src/
├── service/
│   └── widgetService.js          # API service layer
│
└── views/
    └── WidgetManagement/
        ├── WidgetManagement.jsx   # Main component
        ├── WidgetList.jsx         # Widget list with filters
        ├── WidgetForm.jsx         # Create/Edit form
        ├── WidgetAnalytics.jsx    # Analytics dashboard
        ├── widgetConstants.js     # Constants & types
        └── index.js               # Exports
```

## 🔌 API Integration

The system uses `widgetService.js` which implements the following methods:

### Public APIs
```javascript
widgetService.getActiveWidgets(position)
widgetService.trackInteraction(widgetId, action, metadata)
```

### Admin APIs
```javascript
widgetService.getAllWidgets(filters)
widgetService.getWidget(id)
widgetService.createWidget(data)
widgetService.updateWidget(id, updates)
widgetService.deleteWidget(id)
widgetService.updateWidgetStatus(id, status)
widgetService.cloneWidget(id)
widgetService.uploadImage(file)
widgetService.getWidgetAnalytics(id, startDate, endDate)
```

### Required Backend Endpoints

```
Public:
GET    /api/widgets/active
POST   /api/widgets/track

Admin (Protected):
GET    /api/admin/widgets
POST   /api/admin/widgets
GET    /api/admin/widgets/:id
PUT    /api/admin/widgets/:id
DELETE /api/admin/widgets/:id
PATCH  /api/admin/widgets/:id/status
POST   /api/admin/widgets/reorder
POST   /api/admin/widgets/:id/clone
POST   /api/admin/widgets/upload
GET    /api/admin/widgets/:id/analytics
```

## 💻 Usage

### Accessing Widget Management

1. **Navigate to**: `/admin/widget-management`
2. **Via Navigation**: Content Management → Widget Management

### Creating a Widget

1. Click "Create Widget" button
2. Select widget type
3. Configure basic information:
   - Title (for admin reference)
   - Position on page
   - Status (active/inactive)
   - Display mode (always/logged in/logged out)
   - Priority (0-100)
4. Add content specific to widget type
5. Configure display settings:
   - Dismissible option
   - Auto-hide settings
   - Date scheduling
   - Page targeting
   - User targeting
6. Click "Create Widget"

### Editing a Widget

1. Click pencil icon on widget row
2. Modify desired fields
3. Click "Update Widget"

### Managing Widgets

- **Activate/Deactivate**: Click status toggle icon
- **Clone**: Click copy icon to duplicate
- **Delete**: Click trash icon (with confirmation)
- **Filter**: Use dropdowns to filter by status, type, position
- **Search**: Use search box to find widgets by title/type

### Viewing Analytics

1. Navigate to "Analytics" tab
2. View summary statistics:
   - Total widgets
   - Active widgets
   - Total views
   - Average priority
3. See top performing widgets
4. View widgets by type distribution
5. Select specific widget for detailed analytics

## 🎨 Widget Configuration Examples

### Welcome Banner
```javascript
{
  type: 'banner',
  position: 'main_top',
  status: 'active',
  displayMode: 'logged_out',
  priority: 90,
  title: 'Welcome Banner',
  content: {
    imageUrl: 'https://example.com/banner.jpg',
    title: 'Welcome to Our Platform!',
    description: 'Sign up now and get exclusive bonuses',
    ctaText: 'Sign Up',
    ctaLink: '/register'
  },
  settings: {
    dismissible: true,
    startDate: '2026-03-01',
    showOnPages: ['/', '/home']
  }
}
```

### Limited Time Promotion
```javascript
{
  type: 'countdown',
  position: 'top_bar',
  status: 'active',
  displayMode: 'always',
  priority: 100,
  title: 'Flash Sale',
  content: {
    targetDate: '2026-03-31T23:59:59',
    title: '⚡ Flash Sale Ends In:',
    completionMessage: 'Sale Ended!'
  },
  settings: {
    dismissible: false,
    startDate: '2026-03-20',
    endDate: '2026-03-31'
  }
}
```

### Announcement
```javascript
{
  type: 'announcement',
  position: 'top_bar',
  status: 'active',
  displayMode: 'logged_in',
  priority: 80,
  title: 'Maintenance Notice',
  content: {
    message: 'Scheduled maintenance on March 25th, 2:00-4:00 AM',
    type: 'warning',
    icon: '⚠️',
    link: '/announcements'
  },
  settings: {
    dismissible: true,
    endDate: '2026-03-26'
  }
}
```

## 🎯 Widget Positions

Widgets can be placed in these positions:
- **Top Bar** - Sticky top of page
- **Header** - In header area
- **Left Sidebar** - Left side of content
- **Right Sidebar** - Right side of content
- **Main Top** - Top of main content
- **Main Middle** - Middle of main content
- **Main Bottom** - Bottom of main content
- **Footer Top** - Top of footer
- **Footer Bottom** - Bottom of footer
- **Floating** - Floating position
- **Modal** - Popup/overlay

## 🔐 Security

### Authentication
- All admin endpoints require authentication
- Only admin users can access widget management

### Data Validation
- Client-side validation for all fields
- Required fields enforced
- Date range validation
- Priority range validation (0-100)

### Image Upload Security
- File size limit: 5MB
- Accepted formats: jpg, png, gif, webp
- Backend validation required

### XSS Protection
- Custom HTML sanitized (recommended: use DOMPurify on frontend)
- Input validation on all fields

## 📊 Analytics & Tracking

### Automatic Tracking
- **Views**: When widget is displayed
- **Clicks**: When CTA is clicked
- **Dismissals**: When widget is dismissed

### Analytics Dashboard Features
- Summary statistics
- Top performing widgets
- Widgets by type distribution
- Detailed per-widget analytics
- View count tracking
- Date range filtering

### Metrics Available
- Total views
- Total clicks
- Dismiss rate
- Conversion rate
- Time period analytics

## 🎨 Customization

### Adding Custom Widget Type

1. Add type to `WIDGET_TYPES` in `widgetConstants.js`:
```javascript
export const WIDGET_TYPES = {
  // ... existing types
  MY_CUSTOM: 'my_custom',
}
```

2. Add configuration:
```javascript
export const WIDGET_TYPE_CONFIGS = {
  // ... existing configs
  [WIDGET_TYPES.MY_CUSTOM]: {
    label: 'My Custom Widget',
    icon: '🎨',
    description: 'Description here',
    color: 'primary',
    fields: ['field1', 'field2'],
  },
}
```

3. Update `WidgetForm.jsx` to render custom fields

4. Create corresponding component in frontend

### Styling
- Uses CoreUI React components
- Customizable via CoreUI theme variables
- Badge colors: primary, secondary, success, warning, danger, info
- Responsive design included

## 🐛 Troubleshooting

### Widget not saving
- Check browser console for errors
- Verify all required fields are filled
- Check backend API is responding
- Verify authentication token is valid

### Images not uploading
- Check file size (max 5MB)
- Verify file format (jpg, png, gif, webp)
- Check backend upload endpoint
- Verify storage permissions

### Analytics not loading
- Verify widget ID is correct
- Check API endpoint is working
- Check network tab for failed requests

### Widgets not displaying in frontend
- Verify widget status is "active"
- Check date range is current
- Verify display mode matches user state
- Check position is correctly configured
- Ensure frontend widget system is integrated

## 📝 Best Practices

1. **Testing**: Test widgets in inactive status before activating
2. **Scheduling**: Use start/end dates for time-limited promotions
3. **Priority**: Higher priority (90-100) for important widgets
4. **Targeting**: Use page targeting to show relevant content
5. **Analytics**: Monitor performance and optimize based on data
6. **Cloning**: Use clone feature to create variations quickly
7. **Cleanup**: Delete old/expired widgets regularly

## 🔄 Workflow

### Typical Widget Creation Workflow
1. Create widget in inactive status
2. Configure all settings and content
3. Test preview (if available)
4. Set appropriate start date
5. Activate widget
6. Monitor analytics
7. Adjust based on performance
8. Deactivate or delete when done

### Seasonal Campaign Workflow
1. Clone existing successful widget
2. Update content for new campaign
3. Set specific date range
4. Schedule with start date
5. Widget automatically becomes active
6. Widget automatically expires at end date

## 🆘 Support

For issues or questions:
1. Check this documentation
2. Review browser console for errors
3. Check backend API logs
4. Verify all required endpoints are implemented
5. Contact development team

## 📈 Future Enhancements

Potential improvements:
- [ ] A/B testing support
- [ ] Widget templates library
- [ ] Drag-and-drop builder
- [ ] Real-time preview
- [ ] Multi-language support
- [ ] Advanced targeting rules
- [ ] Bulk operations
- [ ] Export/import configurations
- [ ] Widget versioning
- [ ] Advanced analytics charts

## ✅ Checklist for Production

- [ ] All backend API endpoints implemented
- [ ] Authentication configured
- [ ] Image upload storage configured
- [ ] Database tables created
- [ ] Security measures in place
- [ ] Error handling implemented
- [ ] Analytics tracking working
- [ ] Frontend widget system integrated
- [ ] Testing completed
- [ ] Documentation reviewed

---

**Version**: 1.0.0  
**Last Updated**: March 6, 2026  
**Maintained By**: Development Team
