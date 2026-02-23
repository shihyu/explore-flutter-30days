# Day 33：蛤？又忘記上版了：Flutter CI/CD｜GitHub Action 1 🎬

> 原文來源：[Day 3：蛤？又忘記上版了：Flutter CI/CD｜GitHub Action 1 🎬](https://ithelp.ithome.com.tw/articles/10321788)

經過 Day2 Flavor 的洗禮，可能會感受到我一直強調軟體開發中快速迭代的重要性，因為軟體在還沒使用前都是一個黑盒子，一定要你親身體驗才能給出回饋，當然現代已經開發出很多成熟的 Prototype、MVP 的系統，這些都是保證最後交付的結果可以更符合預期，並可以對問題作出即時的修正。


```js
🎬 文章內容包含：
✔ CI/CD 的基礎概念和它們在軟件開發中的重要性。
✔ 持續整合（CI）和持續部署（CD）的各個環節及作用。
✔ 如何使用 GitHub Action 進行基礎的自動化工作。
✔ GitHub Action 的觸發條件和基本配置。
✔ 預覽接下來要介紹的 Flutter CI/CD 的相關設置。

```


## CI/CD 是什麼


再三強調快速迭代的重要性後，我們接下來的系列就是實作 CI/CD 的環節啦 🎉，這是幫助我們快速迭代的重要流程。首先給對 CI/CD 不熟悉的同學們來一段科普，CI/CD 是由 **CI(Continuous integration)「持續整合」** 和 **CD(Continuous Deployment)「持續佈署」** 兩個單字組成。下面我們就來詳細看一下持續整合和持續部署，應該包含哪些部分。


![](https://ithelp.ithome.com.tw/upload/images/20230918/2011736384JItjjc4F.png)


### 持續整合（CI）


- **代碼提交（Code Commit）**

開發者將修改過的代碼提交到版本控制系統（如 Git）。


- **版本控制（Version Control）**

系統會自動追蹤代碼的版本，確保所有更改都有記錄。


- **自動化構建（Automated Build）**

提交後，自動觸發構建過程，將源碼轉換為可執行的程序。


- **單元測試（Unit Testing）**

自動運行單元測試以確保代碼的功能性和健壯性。


- **代碼分析（Code Analysis）**

進行靜態和動態代碼分析，以提高代碼質量和安全性。


- **集成測試（Integration Testing）**

測試新代碼和現有代碼的集成。


### 持續部署（CD）


- **部署到暫存（Staging Deployment）**

將構建的軟體部署到一個暫存環境，進行進一步測試和驗證。


- **用戶接受測試（UAT）**

在暫存環境中進行用戶接受測試。


- **部署到生產（Production Deployment）**

一旦通過所有測試和驗證，軟體就會被自動部署到生產環境。


- **監控和日誌（Monitoring and Logging）**

持續監控應用的性能和錯誤，並保存日誌以便後續分析。


- **回饋與迭代（Feedback and Iteration）**

收集用戶反饋和監控數據，以指導未來的開發工作。


CI/CD 可以被看成一個整體的流程，根據每個專案或團隊的不同，可能在每個環節的實作方式上會有所不同，甚至流程可能也都會有所改變。但不變的是我們希望盡可能的自動化所有的流程，讓開發者只需要專心在代碼的開發上，而不是一直受到其他額外事情的干擾。


在接下來的幾個章節我們分別會介紹到幾個工具來完善我們的自動化流程，


### GitHub Action


- 自動代碼檢測

- 自動化測試

- 自動化部屬


### Melos


- flutter monorepo 管理工具


### Sentry


- log 監控


## GitHub Action 基礎介紹


系列開始的第一天就先來簡單介紹一下 **GitHub Action**，GitHub Action 是 GitHub 的本家出品的 workflow 工具，而且非常佛心的是：即使是免費版的每個月也有 2000 分鐘的使用權，對於一般的小專案來說絕對是綽綽有餘。


![](https://ithelp.ithome.com.tw/upload/images/20230918/20117363JKJ5amHZVm.png)


那要怎麼使用 GitHub Action 呢，當然首先要把專案上傳到 GitHub 上，這部分就不做演示了，接下來到根目錄，新增 `.github` 的資料夾，再新增 `workflows` 的資料夾，裡面放上我們今天要測試的檔案 `github_action.yaml`。最會像這樣 `.github/workflows/github_action.yaml`


```yaml
# github_action.yaml
name: 'GitHub Action Test'

on:
push:
branches:
- main  # Or whatever branch you want to run this action on

jobs:
test_github_action:
name: Validate PR title
runs-on: ubuntu-latest
steps:
- name: Testing GitHub action
run: echo "Hello World GitHub Action"

```


上面是最簡單的範例，我們一行一行接著看。


`name` ：workflow 的名稱


```yaml
# github_action.yaml
name: 'GitHub Action Test'

```


`on`：在哪些情況下要觸發 workflow，以下面的例子來說就是當 main branch 有新的 push commit 進來會觸發這個 workflow。除此之外，GitHub 還支援相當多種條件觸發如：


- `workflow_dispatch`：手動觸發工作流程。

- `repository_dispatch`：通過 GitHub API 或 GitHub App 觸發工作流程。

- `schedule`：按預定時間表觸發工作流程。

- `push`：當有新的推送提交到指定分支時觸發工作流程。

- `pull_request_target`：當有新的 Pull Request 或現有 Pull Request 的發生更改時觸發工作流程。

- `page_build`：當 GitHub Pages 的建構完成時觸發工作流程。

- `deployment`：當部署事件發生時觸發工作流程。


詳細可以參考 [這篇](https://docs.github.com/en/actions/using-workflows/events-that-trigger-workflows) 了解所有條件


```yaml
on:
push:
branches:
- main  # Or whatever branch you want to run this action on

```


`jobs` ：用於定義要執行的工作。一個 workflow 可以包含一個或多個 jobs。每個 job 都是獨立運行的，可以在不同的運行環境上執行，並且可以並行運行。


在上面的例子中，我們定義了一個名為 "test_github_action" 的 job。這個 job 的目的是驗證 github action 是否能被成功 trigger。它運行在最新的 Ubuntu 環境上（`ubuntu-latest`）。


一個 job 可以包含多個 `steps`（步驟），每個步驟都是一個獨立的操作。在這個例子中，我們只有一個步驟，名為 "Testing GitHub action"。這個步驟運行一個 shell 命令 `ehco "Hello World GitHub Action"`，可以根據需要在 `job` 中添加更多的步驟，每個步驟可以執行不同的操作。


```yaml
jobs:
test_github_action:
name: Validate PR title
runs-on: ubuntu-latest
steps:
- name: Testing GitHub action
run: echo "Hello World GitHub Action"

```


在我們設定好 push 到 main branch 就會觸發的條件之後，接下來我們嘗試 push 看看。到 GitHub 的 repository 底下，切換到 `Actions`，就可以發現 “`Hellow World GitHub Aaction"`已經成功被執行並且印出來了！


![](https://ithelp.ithome.com.tw/upload/images/20230918/20117363IC8vA72Qlk.png)


## 結語


接下來幾天都會接者講解 Fltter CI/CD 的相關設定，今天先帶大家了解後續幾天需要的基礎知識，希望你們沒有打哈欠，精彩的部分緊接著會開始！明天會先從自動化測試開始，教大家如何使用 GitHub Action 進行 Flutter 自動化測試！
