<h1>午餐訂訂</h1>
這是一個可以可以用於中、小型規模的團體可以報團訂餐的功能。

<h2>功能</h2>
<li>由管理者來建立使用者帳號</li>
<li>使用者可以查看目前正在進行中的訂單</li>
<li>使用者可以查看餐廳清單、建立一間餐廳的資料或是編輯餐廳</li>
<li>只用者可以在喜歡的餐廳開請訂單供大家一起來訂餐</li>
<li>使用者可以在訂單資訊的頁面看到本次訂單的訂購數、訂購人、說明、總金額與餐廳資料</li>
<li>訂單的發起人和管理者可以關閉訂單也可以重新開啟</li>

<h2>Environment requirements</h2>

<li>Node.js v18</li>
<li>MySQL server v8</li>

<h2>安裝</h2>

git clone https:

```
git clone https://github.com/Yuii24/LunchOrdering
```
<br>
2. 移動到檔案資料夾

```
cd LunchOrdering
```
<br>

3. 安裝相關套件

```
npm install
```

<br />

4. 連結MySQL資料庫

在config/config.json中設定資料庫<br />

<br />

5. 完成資料表與基礎資料的建置

用這個指令來建立資料表
```
npx sequelize db:migrate
```

用這個指令來建立管理者帳號資料
(如果想變更管理者的帳號資料可以在執行前先到seeders資料夾的檔案中更改資料)
```
npx sequelize db:seed:all
```

<br />

6. 啟動應用程式

用這個指令來安裝nodemon
```
npm install -g nodemon
```
並在packages.json檔案中的scripts中加入以下指令
```
"dev": "nodemon app.js"
```

用這個指令來啟動應用程式
```
npm run dev
```

or

使用start來啟動

```
npm run start
```
