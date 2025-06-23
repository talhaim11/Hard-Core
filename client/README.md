# Getting Started with Create React App

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can't go back!**

If you aren't satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you're on your own.

You don't have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn't feel obligated to use this feature. However we understand that this tool wouldn't be useful if you couldn't customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

### Code Splitting

This section has moved here: [https://facebook.github.io/create-react-app/docs/code-splitting](https://facebook.github.io/create-react-app/docs/code-splitting)

### Analyzing the Bundle Size

This section has moved here: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

### Making a Progressive Web App

This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### Advanced Configuration

This section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### Deployment

This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `npm run build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)

## Stopping Automatic Deployment on Render

If you want to stop your React app from being automatically deployed or activated on [Render](https://render.com/), you can:

1. **Pause or Suspend the Service:**  
   - Go to your Render dashboard.
   - Select your web service.
   - Click the "Pause" or "Suspend" button to stop the service from running.

2. **Disconnect the GitHub Repository:**  
   - In your Render service settings, disconnect the linked GitHub repository to prevent automatic deployments from new commits.

3. **Delete the Service:**  
   - If you no longer need the deployment, you can delete the service from the Render dashboard.

These steps will prevent your React app from being automatically activated or deployed by Render.

---

## Troubleshooting: 'sqlite3' is not recognized

If you see the error:

```
sqlite3 : The term 'sqlite3' is not recognized as the name of a cmdlet, function, script file, or operable program.
```

This means SQLite is not installed or not added to your system's PATH.

### How to install SQLite:

#### On Windows

1. Download the precompiled binaries from the [SQLite Downloads page](https://www.sqlite.org/download.html).
   - Under "Precompiled Binaries for Windows", download the file named **sqlite-tools-win32-x86-xxxxxx.zip** (where xxxxxx is the version number).
2. Extract the ZIP file. Inside, you will find `sqlite3.exe`.
   - If you do not see `sqlite3.exe`, make sure you downloaded the correct ZIP file as described above.
3. Add that folder to your system's PATH:
   - Open **Control Panel** > **System** > **Advanced system settings** > **Environment Variables**.
   - Under "System variables", find and edit the `Path` variable.
   - Add the path to your SQLite folder (for example, `C:\sqlite` or `C:\Users\talha\Downloads\sqlite3`—any folder is fine as long as it contains `sqlite3.exe` and is added to your PATH).
4. Open a new terminal and run `sqlite3` to verify installation.

#### On macOS

- Open Terminal and run:
  ```
  brew install sqlite
  ```

#### On Linux

- Open Terminal and run:
  ```
  sudo apt-get install sqlite3
  ```

After installation, you should be able to run `sqlite3 gym.db` from your terminal.

**Tip:**  
You can either:
- Open your terminal and use the `cd` command to go to the folder where `sqlite3.exe` is located before running `sqlite3 gym.db`,  
  **or**
- Add the folder to your system's PATH so you can run `sqlite3` from any directory.

---

**Opening your database file in SQLite:**

When you start the SQLite shell by running `sqlite3` without a filename, it opens a temporary in-memory database.  
To open your actual database file, type at the `sqlite>` prompt:
```
.open gym.db
```
Or provide the full path if needed:
```
.open C:/Users/talha/Downloads/Hard-core gym attendance/gym.db
```

**Next steps in the SQLite shell:**

- To see all tables in your database, type:
  ```
  .tables
  ```
- To see the schema of a table (for example, `users`), type:
  ```
  .schema users
  ```
- To run a SQL query (for example, show all rows from `users`):
  ```
  SELECT * FROM users;
  ```
- To exit the SQLite shell, type:
  ```
  .exit
  ```

---

**Troubleshooting: No tables are shown with `.tables`**

If you run `.tables` and nothing appears, it usually means:

- You have opened an empty or new database file (not your actual database).
- The file path you provided does not point to the correct database file.
- The database file is in a different location.

**How to fix:**g

1. Make sure you are opening the correct database file.  
   - Double-check the file name and path.
   - Use the full path in the `.open` command if needed.

2. If you are not sure where your database file is, search for `gym.db` on your computer.

3. If the file is empty or missing, you may need to restore it from a backup or recreate it.

**Example:**
```
.open "C:/Users/talha/Downloads/Hard-core gym attendance/gym.db"
.tables
```
If you still see no tables, confirm that `gym.db` is not empty and is the correct file.

---
