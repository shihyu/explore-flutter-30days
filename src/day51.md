# Day 51：來聊聊測試這件事（中）｜Mock Package  的深入探索

> 原文來源：[Day 21：來聊聊測試這件事（中）｜Mock Package  的深入探索](https://ithelp.ithome.com.tw/articles/10335645)

昨天，我們聊了一下測試驅動開發（TDD）的概念，了解到它不僅僅是關於「怎麼測試」，更多的是「怎麼思考」。它告訴我們，開發的過程可以更有組織，更有方向。


但寫測試這件事情，並竟還是有枯燥的成分在裡面。於是今天就直接整理一篇工具補帖，來看看有哪些方便有趣的工具可以幫助我們更快速完成測試的工作。希望對大家有點幫助！


## 1. Fake Test Data


### Faker


在軟體開發中，我們經常需要擁有大量資料來確保功能的正確性和效能。但在初期，有時我們可能不希望或不能使用真實的數據（有可能只是懶惰），這時候 **Faker** 就發揮了它的作用。


Faker 用起來也相當簡單，可以快速幫妳生成各種測試資料，非常方便：


```dart
import 'package:faker/faker.dart';

main() {
var faker = new Faker();

faker.internet.email();
// francisco_lebsack@buckridge.com

faker.internet.ipv6Address();
// 2450:a5bf:7855:8ce9:3693:58db:50bf:a105

faker.person.prefix();
// Mrs.

faker.lorem.sentence();
// Nec nam aliquam sem et
}

```


由於文件上沒有寫他到底支援哪些假資料生成，這裡抓出他的程式碼給大家參考一下。


```dart
├── address.dart
├── colors.dart
├── company.dart
├── conference.dart
├── currency.dart
├── date.dart
├── food.dart
├── geo.dart
├── guid.dart
├── image.dart
├── internet.dart
├── job.dart
├── jwt.dart
├── lorem.dart
├── person.dart
├── phone_number.dart
├── random_generator.dart
├── seed.dart
├── sport.dart
└── vehicle.dart

```


目前用下來唯一的小小缺點就是不支援多國語系，只能產出英語的資料，也許日後可以提 PR 幫忙補上。


## 2. Test Auto Generator


### Walltested


最近突然發現的酷工具，可以透過 AI 直接幫你生成需要測試的程式碼，現在我還沒有把他投入生產力工具，不過他的概念蠻有趣的用起來也還不錯，在這裡一併推薦給大家玩玩看。


因為他們官網的文件和 pub.dev 還有 github 的 `README.md` 居然有三種不同的 setup，所以這粒還是提供我自己總結下來可以的方法 🌝


第一步要到官網申請 API Key，目前開起來是對開發者免費，所以可以先不用錢玩看看。API Key 會透過 email 寄給你，就先收好待會用到。


首先安裝 walltestd：


```dart
dart pub global activate welltested

```


接著進入到你的 Flutter 專案，並下指令。這個步驟會直接幫我們在 pubspec.yaml 裝上需要的依賴：


```dart
welltested init

```


在指令過程中會要求你提供剛剛拿到的 API Key


接下來到需要寫測試的 Class，幫他打上 `@Welltested()` 的 Annotation，就會幫你把用到的方法都自動化生成測試。


如果有想特別指定測試案例，可以加上 `@Testcases` ，告訴 AI 要如何生成你的測試案例。


甚至是想跳過哪些方法不寫測試，也可以使用 `@Welltested(excludedMethods: ['logOutUser'])`，來跳過這些方法


```dart
import 'package:welltested_annotation/welltested_annotation.dart';

@Welltested()
class Auth {
String? randomStringVariable;
int? randomIntVariable;
double? randomDoubleVariable;

@Testcases(["if email is not email "])
Future loginWithEmailAndPassword(
{required String email, required String password}) async {
User user = User(uid: "123");
final currentUserId = user.uid;
if (currentUserId == "123") {
return User(uid: "123");
}
if (email.isEmpty || password.isEmpty) {
throw Exception("Email or Password can't be empty");
}
if (email == "test@test.com" && password == "password") {
user = User(uid: "123456");
}
return user;
}

Future logoutUser() async {
//Add Logout Functionality
}
}

class User {
final String uid;
User({required this.uid});
}

```


通通都設定完成之後，就可以開始生成 Unit test


```dart
welltested generate unit

```


經過一小段時間的等候，就可以看到 test 資料夾底下，已經自動幫我們生成所需要的程式碼摟，他會幫你以 class 當作資料夾的名稱，裡面的檔案則是每個需要測試的方法。這裡附上最後的生成結果讓大家看一下


```dart
import 'package:flutter_day_21_tester/auth.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:mockito/annotations.dart';
import 'package:mockito/mockito.dart';

import 'loginWithEmailAndPassword.welltested_test.mocks.dart';

@GenerateMocks([User])
void main() {
late Auth auth;
late MockUser mockUser;

setUp(() {
auth = Auth();
mockUser = MockUser();
});

test('login with valid credentials', () async {
when(mockUser.uid).thenReturn('123456');
final result = await auth.loginWithEmailAndPassword(
email: 'test@test.com', password: 'password');
expect(result.uid, '123456');
});

test('login with empty email', () async {
expect(() async {
await auth.loginWithEmailAndPassword(email: '', password: 'password');
}, throwsException);
});

test('login with empty password', () async {
expect(() async {
await auth.loginWithEmailAndPassword(
email: 'test@test.com', password: '');
}, throwsException);
});

test('login with already logged in user', () async {
when(mockUser.uid).thenReturn('123');
final result = await auth.loginWithEmailAndPassword(
email: 'test@test.com', password: 'password');
expect(result.uid, '123');
});

test('login with invalid credentials', () async {
final result = await auth.loginWithEmailAndPassword(
email: 'invalid@test.com', password: 'invalidpassword');
expect(result.uid, '123');
});

test('login with non-email string', () async {
expect(() async {
await auth.loginWithEmailAndPassword(
email: 'notanemail', password: 'password');
}, throwsException);
});
}

```


WellTested 算是很酷的工具，生成的測試看起來也有模有樣的，不過因為我沒有深入使用，所以不確定更複雜的狀況會不會有什麼問題。


目前小詬病的地方就是文件更新看起來不太及時，而且 AI 生成測試的時間雖然不長但是也不算太短。體感大概 1~2 分鐘，如果你有一些還沒有寫測試的地方，不妨來試用看看。


## 3. Mocking


### Mocktail vs Mockito


如果經常寫 Flutter 測試，這兩個工具應該就是必備其一了。這兩個工具都是 Flutter 測試中模擬對象的首選。Mockito 是比較早出來的工具，所以使用的人數較多，也更多專案有依賴他。Mockito 依賴於 Annotation 他需要先幫要 Mock 的 class 加上 `@GenerateNiceMocks` ****，然後透過 build_runner 去產生對應的 Mock class。


但如果是專案比較大的人，就會開始對 build_runner 產生害怕，因為動輒都要自動生成幾千個檔案，實在是花太多時間。 Mocktail 就是看準這點，他可以不透過 build_runner 去生成對應的類別，而是直接透過 extends 搭配 when 來覆蓋原本的方法，讓使用上更快速簡便。


接下來快速看看兩邊的程式碼對比：


### 建立 Mock Class:


差別只在一個用 Annotation 另一個直接 extends `Mock`，不過 Mockito 還會生成另外一個 `.mock.dart` 的檔案，所以會更不靈活一點。


**Mockito**


```dart
import 'package:mockito/annotations.dart';
import 'package:mockito/mockito.dart';

// Annotation which generates the cat.mocks.dart library and the MockCat class.
@GenerateNiceMocks([MockSpec()])
import 'cat.mocks.dart';

// Real class
class Cat {
String sound() => "Meow";
bool eatFood(String food, {bool? hungry}) => true;
int lives = 9;
}

void main() {
// Create mock object.
var cat = MockCat();
}

```


**Mocktail**


```dart
import 'package:mocktail/mocktail.dart';

// A Real Cat class
class Cat {
String sound() => 'meow!';
bool likes(String food, {bool isHungry = false}) => false;
final int lives = 9;
}

// A Mock Cat class
class MockCat extends Mock implements Cat {}

void main() {
// Create a Mock Cat instance
final cat = MockCat();
}

```


### Verify 和 Expect


在Flutter的單元測試中，`verify` 和 `expect` 是兩個常用來確認模擬物件行為和結果的方法。這些方法通常與Mockito或Mocktail這樣的模擬函式庫一起使用。


**expect**


`expect` 是Flutter測試框架中的一個函數，用於驗證某個結果是否符合預期。它接受兩個參數：actual(實際的結果) 和 matcher(預期的結果或條件)。


例子中使用 `expect(cat.sound(), 'Purr');` 是為了確認 `cat.sound()` 的返回值是否為 `'Purr'`。


**verify**


在Mockito或Mocktail中，`verify` 是一個函數，用於確認某個模擬方法是否被調用，以及被調用的次數。


在上面的例子中，`verify(cat.sound()).called(2);` 和 `verify(() => cat.sound()).called(2);` 分別用於確認 `cat.sound()` 方法被調用了兩次。


**Mockito**


```dart
// Stub a mock method before interacting.
when(cat.sound()).thenReturn('Purr');
expect(cat.sound(), 'Purr');

verify(cat.sound()).called(2);

```


**Mocktail**


```dart
// Stub a method before interacting with the mock.
when(() => cat.sound()).thenReturn('Purr');
expect(cat.sound(), 'Purr');

verify(() => cat.sound()).called(2);

```


Mockito 和 Mocktail 可以從上面中的對比知道其實兩者的差異並沒有那麼大，更多的差別在於他們內部如何實現這些方法。那講到這裡相信大家可能多少有點好奇 Mocktail 是如何在不用生成新的 class 的情況下可以做到覆蓋原本的方法。這就必須要提到 dart 中一個你常見過卻不知道他竟然有這個用途的方法：`noSuchMethod`


### Mocktail 核心講解


### noSuchMethod


在 Dart 中，你可以通過覆蓋 `noSuchMethod()` 來自訂對象如何回應在其 class chain 中沒有明確定義的方法。白話文就是：只要 override `noSuchMethod` 就等於你可以操作任何沒有明確定義的方法做任合事情，Mocktail 就是巧妙的利用這一點來覆蓋原有的方法。


我們一起來欣賞一下這段最核心的原始碼


```dart
@override
dynamic noSuchMethod(Invocation invocation) {
invocation = _useMatchedInvocationIfSet(invocation);
if (_whenInProgress) {
_whenCall = _WhenCall(this, invocation);
return null;
} else if (_verificationInProgress) {
_verifyCalls.add(_VerifyCall(this, invocation));
return null;
} else if (_untilCalledInProgress) {
_untilCall = _UntilCall(this, invocation);
return null;
} else {
_realCalls.add(RealCall(this, invocation));
_invocationStreamController.add(invocation);
final cannedResponse = _responses.lastWhere(
(response) {
return response.call.matches(invocation, {});
},
orElse: __defaultResponse,
);
return cannedResponse.response(invocation);
}
}

```


```dart
dynamic noSuchMethod(Invocation invocation) {

```


這是一個覆寫的 `noSuchMethod` 方法。每當在 Mock 對象上調用不存在的方法時，此方法都會被觸發。


```dart
invocation = _useMatchedInvocationIfSet(invocation);

```


嘗試獲取與當前調用匹配的已設置的模擬行為（如果有的話）。


```dart
if (_whenInProgress) {
_whenCall = _WhenCall(this, invocation);
return null;
}

```


如果 `_whenInProgress` 為 `true`（表示當前正在進行一個 `when` 調用），則它將創建一個新的 `_WhenCall` 對象以捕獲這次調用，並將其儲存起來。


```dart
else if (_verificationInProgress) {
_verifyCalls.add(_VerifyCall(this, invocation));
return null;
}

```


如果 `_verificationInProgress` 為 `true`，則代表正在進行一個驗證操作（例如 `verify`）。它會創建一個新的 `_VerifyCall` 對象來捕獲這次調用並將其加入 `_verifyCalls` 列表中。


```dart
else if (_untilCalledInProgress) {
_untilCall = _UntilCall(this, invocation);
return null;
}

```


如果 `_untilCalledInProgress` 為 `true`，這表示正在進行一個 `untilCalled` 操作。它將創建一個 `_UntilCall` 對象來捕獲這次調用。


```dart
else {
_realCalls.add(RealCall(this, invocation));
_invocationStreamController.add(invocation);

```


在其他所有情況下（也就是在一般的方法調用中），它將這次調用視為一個真實的調用 (`RealCall`) 並將其儲存。它還將這次調用發送到 `_invocationStreamController`，這可能用於後續的事件處理或其他操作。


```dart
final cannedResponse = _responses.lastWhere(
(response) {
return response.call.matches(invocation, {});
},
orElse: __defaultResponse,
);
return cannedResponse.response(invocation);

```


接著，它將尋找一個已設置的模擬回應 (`cannedResponse`)，這個回應應該匹配當前的調用。如果找到了，它會返回該模擬回應；如果沒有找到，則返回一個預設的回應。


總之，這個 `noSuchMethod` 方法的目的是捕獲對模擬對象的所有方法調用，並根據當前的狀態（例如，是否正在執行 `when` 或 `verify` 操作）決定如何回應。這就是 `Mocktail` 如何模擬方法調用並允許你設定期望和驗證調用的方式。希望大家有學到新東西（雖然明明是要講測試的ＸＤ）


## 總結


總結來說，無論是從偽造測試資料的 Faker 到自動生成測試的 Walltested，再到模擬對象的 Mocktail 和 Mockito，每一個工具都為我們的測試提供了不少助力。而 Dart 中的 `noSuchMethod` 真的是一個眼睛一亮的特性，充分展示了 Dart 語言的魅力。雖然說在開發的過程中，有些人可能對測試感到害怕，但有了這些工具，至少我們可以說，「測試，也沒那麼可怕！」。希望這篇文章能為大家的 Flutter 的測試之旅帶來一點啟示和便利！明天見～
