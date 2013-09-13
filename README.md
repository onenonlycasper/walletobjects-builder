Wallet Objects Builder Quickstart
=================================
This guide is intended as a reference for getting the tool up and running as 
well as explaining its functionality.

Purpose
-------
This tool gives users the ability to manipulate and create their Wallet Objects
through a user-friendly WYSIWYG (What You See Is What You Get) web experience. 

The tool's server-side also covers all the API calls associated with the 
[Wallet Objects API] [1] so that examples are provided for each.

  [1]: https://developers.google.com/commerce/wallet/objects/

Getting Started
---------------
The following instructions assume that you want or have [Eclipse] [2] installed on your
machine. If you do not want to use Eclipse, you may follow the instructions
using a different method specified under [Installing the Java SDK] [3] and using 
the source code provided here.

1. Install Eclipse
  * Go to [Eclipse Downloads] [6] and download and install Eclipse Standard 4.3
  (or other) for your operating system.
2. Install the Java Google App Engine SDK
  * Install the Java SDK as shown under [Getting Java] [3]
  * Install the Google Plugin for Eclipse as shown under [Installing the Plugin] [4]
3. Clone this repository
4. Import the Project
  * Open up Eclipse and click `File -> Import`
  * Make sure 'Existing Projects into Workspace' is selected then click `Next`
  * Select root directory and browse for the `walletobjects-builder`
  directory you have downloaded
  * Click `Finish` and allow Eclipse to set up the project
5. Get your private key
  * Copy your private key xxx.p12 to the `war/WEB-INF` directory
6. Edit appengine-web.xml in the war/WEB-INF directory
  * Change property SERVICE_ACCOUNT_ID to your service account id
  * Change property PRIVATE_KEY to the name of your private key
7. Run the Wallet Object Builder
  * Right click on the newly imported project and selected `Run As -> Web
   Application`
  * Visit [localhost:8888] [5] to start using the tool!

  [2]: http://www.eclipse.org/
  [3]: https://developers.google.com/appengine/docs/java/gettingstarted/installing
  [4]: https://developers.google.com/eclipse/docs/getting_started
  [5]: http://localhost:8888
  [6]: http://eclipse.org/downloads/

When the tool is up and running in order to view your classes, simply input your
Google-issued issuer id and hit load classes.

Functionality
-------------
This tool enables one to manipulate and create Wallet Object classes/objects. 
Each item is contained within its own card, and at first-look is read only.

### Creation

#### Class

In order to create a class, click the red button below the top bar. This will add
a new card that lets you choose both which Wallet Class to create and which Render
Specs to use. Use the drop-down menus to choose and then click `Load Template`.
Fill out all the fields relevant for your class, as well as the several
required fields for classes that must be specified before insertion. For more
information about the required fields, refer to the [Wallet Objects API Reference] [7].
Clicking `Save` below the item card will insert the item into your issuer id.

  [7]: https://developers.google.com/commerce/wallet/objects/reference/v1/

#### Object

In order to create an object you must first have an existing class inserted
into your issuer id. Click on the class' menu button in the top right of its
card and click `View Objects`. You may then click the red button below the top
bar to add a new card that represents an object. Fill out all fields relevant
for this object, as well as the required fields specified in the API reference.
No Save button is present while creating an object, instead clicking `Get JWT`
will allow you to continue the creation by entering the object origins and obtain
a copy-and-pastable Save to Wallet script.

### Editing

If you would like to edit a specific item, search for it using its id 
(without pre-pending your issuer id). In order to begin `editing`, click on 
the drop-down menu located in the top right of any card. If you are editing using 
the edit item functionality, clicking `Save` below the item card will update 
the item on the server.

This menu allows you to do some the following (depending on its type):

  * **Edit Item / View as Template**:
      Allows one to edit text in the item, or make the card read only once again 
      if already in edit mode
  * **View Objects**:
      For classes only, allows one to view objects associated with the chosen class
  * **Add Message**:
      Allows one to add a message to the item (existing loyalty and generic 
      items only)
  * **View/Edit Locations**: 
      Allows one to edit the item's locations using Google Maps Places

Note: Edit Item also allows you to add messages, however the Add Message 
      option uses the "addmessage" request versus an "update".

Looking at the Code
-------------------
If you would like to read parts of the Java or JavaScript code, here are some
guidelines:

### Java

All API operations are covered like so:

  * `insert` and `update` are used in `SaveServlet.java`
  * `list` is used in both `ClassListServlet.java` and `ObjectListServlet.java`
  * `patch` is used in `PatchServlet.java`
  * `get` is used in `SearchServlet.java` (also Save & Patch Servlets)
  * `addmessage` is used in `AddMessageServlet.java`

### JavaScript

  * UI logic (button clicks, etc.) is located in `ui.js`
  * Card item logic is located in `page.js`
  * Server logic is located in `server.js`
  * Maps logic is located in `maps.js`

