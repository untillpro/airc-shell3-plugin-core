## Overview

`ListTable` component is a common component for display table data in plugin.

## Properties

- `entity` - `<string>` - entity type;
- `data` - `[<object>]` - data for display;
- `pages` - `<number>` - total pages count; required in `manual` mode
- `page` - `<number>` - page number; required in `manual` mode
- `pageSize` - `<number>` - page size; required in `manual` mode
- `total` - `<number>` - total pages; required in `manual` mode
- `manual` - `bool` - is in manual mode;
- `order` - `[<object>]` - custom ordering;
- `filter` - `[<object>]` - custom filter;
- `onPageChange` - `<function>` - callback for `page change` event;
- `onPageSizeChange` - `<function>` - callback for `p`age size change` event;
- `onDoubleClick` - `<function>` - callback for `row double click` event;
- `onRowClick` - `<function>` - callback for `row click` event;
- `onSelectedChange` - `<function>` - callback for `selected rows change` event;
- `onSortedChange` - `<function>` - callback for `sorted change` event;
- `onFilterChage` - `<function>` - callback for `filter change` event;
- `onShowDeletedChanged` - `<function>` - callback for `show deleted taggler` event;
- `rowActions` - `[<object>]` - array of row actions definitions objects;
- `headerActions` - `[<object>]` - array of header buttons definitions objects;
- `search` - `<string>` - search string;

## Contribution points

### `list.<entity>.component` contribution point

This properties can be passed throw `list.<entity>.component` contribution point
- `showPagination` - `bool` - if `true` will display pagination bars(`true` by default);
- `showPaginationBottom` - `bool` - if `true` will display bottom pagination bar (`true` by default);
- `showPaginationTop` - `bool` - if `true` will display top pagination bar(`true` by default);
- `showPageSizeOptions` - `bool` - if `true` will display `paze size selector` on pagination bars (`true` by default);
- `showActionsColumn` - `bool` - if `true` will display `Actions` column per row based on `list.<entity>.actions` contribution point (`true` by default);
- `allowSelection` - `bool` - if `true` will allow row selection (`true` by default);
- `allowMultyselect` - `bool` - if `true` multy row selection will be allowed(`true` by default);
- `showColumnsToggler` - `bool` - if `true` will display column toggler on table header (`true` by default);
- `showDeletedToggler` - `bool` - if `true` will display `Show deleted` toggler on table header(`true` by default);
- `showPositionColumn` - `bool` - if `true` will display `Position` column per row (`true` by default);
- `showTotal` - `bool` - if `true` will display total for columns that have `totalType` props specified; `false` by default; 
- `actions`- `[ <string> ]` - allowed action buttons to display on header; a list of allowed values (not all values suports by all components): 
  - `add`,
  - `remove`,
  - `refresh`,
  - `edit`,
  - `massedit`,

- `searchBy` - string - name of field to search by (`name` by default)

Example: 
```javascript
manager.registerContribution(TYPE_LIST, resourceName, C_LIST_COMPONENT, {
    'allowMultyselect': false,
    'allowSelection': true,
    'showColumnsToggler': true,
    'showDeletedToggler': true,
    'deletedTogglerLabel': 'Show deleted courses',
    'showPositionColumn': true,
    'showTotal': true,
    'actions': [ 
        'add',
        'remove',
        'edit',
        'refresh',
    ]
});
```

### `list.<entity>.manual` contribution point

Example: 
```javascript

```

### `list.<entity>.actions` contribution point

Example: 
```javascript

```

### `list.<entity>.columns` contribution point

Represents a list of columns for `TableList` component; list of available properties: 
- `id` - `<string>` - required if `accessor` is function; if `accessor` is string will be similar as it's value;
- `Header` or `header` - `<string>` - column header value
- `accessor` - `<string> | <function>` - row value accessor; can be a function like: `(d) => d.accessor` - where `d` is an original row object;
- `Footer` - `<string> | <JSX>` - column footer content
- `width` - `<number>` - fixed column width value; if not set will be calculated based on other columns.
- `type` - `<string>` - cell value type; the corresponding component will be displayed based on it; default value is `string`; available values:
 - `string` - default - for displaing and editing string values;
 - `location` - for displaing user-friendly location names, not an IDs; read only;
 - `number` - for displaing and editing number values;
 - `boolean` - for displaing and editing boolean values;
 - `price` - default - for displaing and editing price values; 
 - `date` - default - for displaing and editing date values; 
 - `time` - default - for displaing and editing time values; 
- `totalType` - `<string>` - if `component.showTotal` is `true` will display a total value base on this type. Available values: 
 - `number_total` -  total sum value for all rows ; 
 - `number_min` - minimum value for all rows ; 
 - `number_max` - maximum value for all rows ; 
 - `number_mean` - mean value for all rows ; 
 - `count` - show total row count; 
 - `uniq` - show number of uniq string;
- `filterType` - `<string>` - 
 - `number` - displays a number input; exact matching;
 - `select` - displays a select dropdown with all available values; exact matching;
 - `price` - displays range number selector with; range matching;
 - `range` - displays range number selector with; range matching;
 - `group` - display a group of checkbox with all available values; multy exact matching;
 - `date` - displays a range date picker; range matching;
 - `time` - displays a range time picker; range matching;
- `filterable` - `<bool>` - if `false` a filtering by this column will be prevented; `true` by default;
- `toggleable` - `<bool>` - if `false` this column will be not in `Column toggler` list; `true` by default;
- `editable` - if `true` the value can be edited in-table;

Example: 
```javascript
manager.registerContribution(TYPE_LIST, resourceName, C_LIST_COLUMNS, {
    'Header': 'Name',
    'accessor': 'name',
    'filterable': true,
});

manager.registerContribution(TYPE_LIST, resourceName, C_LIST_COLUMNS, {
    'id': 'hq_id',
    'Header': 'HQ ID',
    'accessor': d => d.hq_id || ' - ',
    'sortable': false
});
```


