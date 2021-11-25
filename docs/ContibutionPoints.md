# Contribution Points

Each contribution has four parameters to be added:
- `type`
- `point`
- `property`
- `value`

Type shoul be one of:
- [url]()
- [list]()
- [forms]()
- [sections]()
- [formsgroups]()

Let's check each type separately.

## `Url`

Each entity manager registers it's own urls to manipulate with backoffice data.

As `point` name more often a name of Entity Manger is used

Available `properties`:
- `getUrl` - used to receive list of entity items or a detail item info
- `postUrl` - used to create new entiy items
- `postUrl` - used to update existing entity item
- `postUrl` - used to change entity item status

As `value` object should be passed:
```javascript
{
    "queue": 'airs-bp', // queue alias; required
    "path": 'salesareas', // resource name; required
    "method": 'put', //http method; required
    "props": {} //props passed to server
}
```

#### Example:

```javascript
manager.registerContribution('url', 'articleEntityManager', 'getUrl', {
    queue: 'airs-bp-view/collection', 
    resource: 'salesareas',
    method: 'post',
    props: {
        page: 1
    }
});

manager.registerContribution('url', 'articleEntityManager', 'postUrl', {
    queue: 'airs-bp', 
    resource: 'articles',
    method: 'post'
});

```

## `List`

If entity manager displays list of it's items it should register some contributions of that type.

As `point` name more often a name of Entity Manger is used.

#### Available properties:
- **`columns`** - [*Objects*]. Each contribution to this property is a declaration of one `column` in entity manager list view.  
      
    Below **example** add two static columns: `HQ ID`and`NAME` - and one dynamic column `PRICES`,
    Dynamic column - is a content-based columns. It means that number of columns and it's content a based on a data it recieves.

    If column marked as `dynamic` it should provide a special `generator` function, that maps row data into column. Data returned by an `accessor` should be an array or object in this case.     
     
    ```javascript
        manager.registerContribution('list', 'articleEntityManager', 'columns', { //simple static column
            'Header': 'Name',
            'accessor': 'NAME',
        });

        manager.registerContribution('list', 'articleEntityManager', 'columns', { // column with function as accessor. It better be used to display aggregate or formatted data
            'id': 'hqId', 
            'Header': 'HQ ID',
            'accessor': d => d.HQ_ID || ' - ',
            'sortable': false
        });

        manager.registerContribution(TYPE_LIST, resourceName, C_LIST_COLUMNS, { // dinamic column
            'accessor': d => d.PRICES, // or string PRICES
            'dynamic': true,
            'generator': item => {
                return {
                    'id': item.ID,
                    'Header': item.NAME,
                    'accessor': d => d.PRICES[item.ID] ? d.PRICES[item.ID].VALUE : ' - '
                };
            }
        });
    ```

    Below example add to columns to a list - `HQ ID` and `NAME`. 
    More info about columns declaration and they properies you can find here: [https://github.com/tannerlinsley/react-table/tree/v6#columns](https://github.com/tannerlinsley/react-table/tree/v6#columns)

    ---
- **`component`** - Object. - entity list view component props.

    Most common **example**:

    ```javascript
    manager.registerContribution('list', 'articleEntityManager', 'component', {
        'allowMultyselect': false, // if true allows to select more than one item in list
        'allowSelection': true, // if true allows to select items in list
        'showColumnsToggler': true, // if true displays column selector in component header
        'showDeletedToggler': true, // if true displayi control, that allows to show/hide non active items in list
        'deletedTogglerLabel': 'Show deleted categories', // label of Deleted Toggler. If not  specified a default text will be used/
        'showPositionColumn': true, //if true will add position column to a list
        'actions': [ // actions in right side of table header; common table actions.
            'add', //adds 'Add item' button.
            'remove', //adds 'Removed' button. Active if line selected. Can be used with multyselect
            'copy', //adds 'Copy item' button. Active if line selected.
            'edit', //adds 'Edit item' button. Displays only if one line selected.
            'massedit' //adds 'Mass modify' button. Displays only if few lines selected.
        ]
    });
    ```
    ---
- **`table`** - Object. Table props. Full list of table properties you can find here: [https://github.com/tannerlinsley/react-table/tree/v6#props](https://github.com/tannerlinsley/react-table/tree/v6#props)

    Next properties not allowed and fill not has any effect:
    - `data`
    - `pages`
    - `loading`
    - `columns`
    ---
- **`actions`** - [*String*]. - list of available rows actions. Displays for each row.
    Values should be one of:
        - `edit` - edit row
        - `copy` - copy row
        - `unify` - unify row across all selected locations
        - `remove`- activate/deactivate row

    **Example**: adding two actions - `edit` and `copy` - to each row in list

    ```javascript
    manager.registerContribution('list', 'articleEntityManager', 'actions', 'edit');
    manager.registerContribution('list', 'articleEntityManager', 'actions', 'copy');
    ```

## `Forms`

`form` type are responsible for entity edit forms declaration.

As `point` name more often a name of Entity Manger is used.

#### Available properties:
- `sections` - [*String*] - List of available form sections. At least one section should be added to a form. Otherwise it will be an exception.<br>
    Example: 
    ```javascript
        manager.registerContribution('forms', 'articleEntityManager', 'sections', 'sectionCode');
        manager.registerContribution('forms', 'articleEntityManager', 'sections', 'sectionCode');
    ```
    This example adds two sections to a form that cna be used to declare form fields.

    However sections names are declares in `sections` contribution type that describes below.

    ---
- `component` - *Object*. `Form edit` component properties. All available properties are described in the example below.

    Most common **example**:

    ```javascript
        showActiveToggler: true, //if true add item activeness toggler
        showNavigation: true, // if true add navigation block to a header 
        showLocationSelector: true, //if true add location selector in header
        allowValidate: false, // if true shows "Validate" button 
        actions: [ // add actions to a form header
            'add', // adds new entity item
            'copy', // copy current item
            'unify', // unify current item across all selected locations
        ]
    ```

## `Sections`

Describes edit form sections.

As a `point` name, use the `sectionCode` that was added to a form contribution type.

#### Available properties:

- `name` - String
- `fields` - [*Object*]. Each object describes one field in the section. More information about fields declaration and all available types you can find [here](./EMFieldTypes.md)

## `Formsgroups`

Allows to customize fields groups.

As a `point` name, use the `group` name that was specified in the `field` parameter

#### Available properties:
- `name` - String - if specified adds a group name header to a fields group.
- `tabs` - Boolean - if `true` group become a tabs group in which all fields will be placed in separate tabs. To add tab's title you should configure `header` property in field declaration
- `tabsProps` - Object - if group if tabs group (tabs = true) you can pass some props to customize it. All available props described below:
    

    ```javascript
    {
        "default": 0, // Number. a default tab. begins from zero
        "animdated": "false" // if 'true' tabs will have slide in effect while changing. Otherwise there will be 'fade in - fade out` effect.
    }
    ```