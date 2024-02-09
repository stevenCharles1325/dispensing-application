
# XGEN DISPENSING APPLICATION

## Tech Stack

- Electron
- Electron React Boilerplate
- React
- Zustand
- ReactRouter
- TailwindCSS
- Material UI
- NodeJS
- SQLite
- JWT
- MinIO (Object-storage)
- Docker
- CRON

## 3rd-party dependencies
- [Zadig](https://zadig.akeo.ie/)
- [WKHTMLTOPDF](https://wkhtmltopdf.org/downloads.html)

## Features
- Auto unit-of-measurement calculation
- Barcode Scanning
- Device Storage Monitoring
- Employee Management
- Excel - Transaction Import/Export (Overall, or Current day, month, or year)
- Export a transaction as PDF or Receipt
- Image Management
- In-App Notifications
- Offline
- Product Bulk Upload
- Product Expiration Monitoring
- Receipt Printing
- Report Graphs
- Roles & Permissions Management
- Shortcut-key Management
- SQL - Transaction Export
- Stock Movement Management
- Stock-in and Stock-out



## Run Locally

1. Clone the project

```bash
  git clone https://github.com/stevenCharles1325/dispensing-application.git
```

2. Go to the project directory

```bash
  cd dispensing-application
```

3. Install dependencies (Run the 3rd-party deps as well)

```bash
  nvm install && npm i --legacy-peer-dep && npm run dep:binaries:minio
```

4. Edit index.js of `/resources/app/node_modules/escpos-usb`.
Look for the line with `usb.on('detach', ...` and change it to `usb.usb.on('detach', ...`


5. Start the server

```bash
  npm start
```


## Deployment

To package this project run

```bash
  npm run package -- --[linux, win]
```
Or with debuggin on
```bash
  npx cross-env DEBUG_PROD=true npm run package -- --[linux, win]
```

Note: Run in administrator mode on Windows.

