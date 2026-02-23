# Day 44：啊哈！提升 Flutter 安全性的第八種方法｜Flutter Security 2

> 原文來源：[Day 14：啊哈！提升 Flutter 安全性的第八種方法｜Flutter Security 2](https://ithelp.ithome.com.tw/articles/10331115)

昨天跟各位介紹如何提升 Flutter 安全性的七種方法，發現漏掉了一個重要的 package：[flutter_secure_storage](https://pub.dev/packages/flutter_secure_storage)。


在開發移動應用程式時，安全地存儲用戶敏感資料，例如憑證、令牌和私鑰，是非常重要的。Flutter Secure Storage是Flutter的一個插件，使開發人員能夠以安全的方式存儲這些資料。


Flutter Secure Storage的背後是依賴於原生平台的安全存儲機制。對於iOS來說，這就是Keychain；對於Android來說，這就是Keystore。


### 1. iOS的Keychain


**什麼是Keychain？**


Keychain是一個由Apple提供的安全存儲系統，用於保存用戶的敏感資料，如密碼、鑰匙、憑證和其他私密信息。Keychain的數據是加密的，並存儲在一個專用的、隔離的環境中，以防止未經授權的訪問。


**Keychain的特點：**


- **安全性**：Keychain使用了高強度的加密算法（AES）來確保存儲的數據的安全性。

- **持久性**：儲存在Keychain中的資料，即使app被刪除，這些資料也會保留。這樣，當用戶重新安裝app時，可以重新訪問這些資料。

- **隔離性**：每個應用程序都有自己的隔離空間在Keychain中。但是，app也可以選擇共享其Keychain項目，只要它們擁有相同的Team ID和設定了適當的Keychain Sharing Entitlement。

- **多設備同步**：使用iCloud Keychain，用戶可以在他們所有的Apple設備之間同步密碼和其他安全資料。


**如何在Flutter Secure Storage中使用Keychain？**


Flutter Secure Storage插件在iOS上的實作，實際上是依賴於Keychain的API。這意味著，當你嘗試在Flutter app中存儲或檢索資料時，實際上是在Keychain中進行的。


我們可以先從 Library 的原始碼看起


```objectivec
- (instancetype)init {
self = [super init];
if (self){
self.query = @{
(__bridge id)kSecClass :(__bridge id)**kSecClassGenericPassword**,
};
}
return self;
}

```


目前使用到 keychain 的 kSecClassGenericPassword


### kSecClassGenericPassword 機制


keychain 可以視作一個 api 而每個通道會有相應的限制與規則，`kSecClassGenericPassword` 是只有在使用者手機已經 unlock 的情況下，才能夠取到相對應的值。
換句話說在鎖屏的狀況中 keychain 的 api 不會回傳任何資訊給使用者，所以一但我們的私鑰資料已經不存在於 memory 中，攻擊者要還原出密鑰應該是不太可能。


使用者透過 apple 備份 app 到其他手機或裝置時，備份的資料同樣是被 keychian 加密過後的檔案，所以即便拿到使用者的備份資料，只要 keychain (可以理解為 apple 帳號) 不要被攻破，備份資料並沒辦法直接還原出私鑰與加密的檔案。


### Android的 Keystore


**什麼是Android的 Keystore？**


Keystore是Android系統的一部分，用於保存、管理和保護用戶和系統的密鑰材料。它提供了一個加密的容器來存儲私鑰和證書，這些密鑰和證書用於多種用途，如用於數據加密、身份驗證和設置安全通訊。


**Keystore的特點：**


- **安全性**：所有存儲在Keystore中的密鑰材料都是加密的，確保其安全性不會被輕易地泄露。

- **封裝性**：Keystore提供了一個隔離的環境，以防止存儲的密鑰直接被app訪問。此外，許多密鑰操作，如簽名和解密，都在Keystore的封裝內部完成。

- **硬件安全模塊（HSM）或TEE（受信任的執行環境）**：這些是物理或邏輯隔離的環境，用於執行密鑰操作，增強了操作的安全性。

- **生命周期管理**：Keystore還允許您設定密鑰的有效期和使用條件，如要求用戶認證、限制密鑰的使用次數等。


**結論**


Flutter Secure Storage提供了一個簡單且安全的方式來在Flutter apps中存儲敏感資料。通過利用iOS的Keychain和Android的Keystore，這個插件確保您的資料在各種移動設備上都能得到最佳的保護。如果您是Flutter開發者，並且需要安全地存儲敏感資料，那麼Flutter Secure Storage絕對值得一試。
