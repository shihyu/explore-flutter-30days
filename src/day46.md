# Day 46：Flutter 狀態管理：深入理解 Riverpod (下)

> 原文來源：[Day 16：Flutter 狀態管理：深入理解 Riverpod (下)](https://ithelp.ithome.com.tw/articles/10332302)

中秋節大家有好好賞月嗎，趁著連假有空的時候，繼續把 Riverpod 內容繼續讀完，上班時間可沒那麼多體裡可以把它嗑完。那廢話不多說就開始吧！


**ProviderContainer 是如何交互的**


由昨天所提到的部分，我們可以知道 `ProviderContainer` 才是那個真正記錄所有狀態的核心，不過在平常開發中，大部分的時間我們並沒有直接操作他，而是透過 `ref.raed` 或 `ref.watch`，去查看當前 provider 的狀態，今天要講的部分就是這中間的過程是如何完成的。


**如何建立 Provider**


首先先從如何建立 Provider 開始看起，要建立每一個 Provider 都需要提供一個  `_createFn: (ref)⇒false`，那 `_createFn` 實際上到底是做了什麼呢？


```dart
final myProvider = Provider((ref) => false);

```


那我們就必須深入 Provider 的程式碼裡面，在這裡你可以看到每個 Provider 類型都被需要去繼承一個方法就是 `_create`，這裡定義了在每個 Provider 被建立出實體時，也會一併去建立一個相對應的 `ProviderElement`。


```dart
class Provider extends InternalProvider
with AlwaysAliveProviderBase {
/// {@macro riverpod.provider}
Provider(
this._createFn, {
super.name,
super.dependencies,
@Deprecated('Will be removed in 3.0.0') super.from,
@Deprecated('Will be removed in 3.0.0') super.argument,
@Deprecated('Will be removed in 3.0.0') super.debugGetCreateSourceHash,
}) : super(
allTransitiveDependencies:
computeAllTransitiveDependencies(dependencies),
);

...

final Create> _createFn;

@override
State _create(ProviderElement ref) => _createFn(ref);

@override
ProviderElement createElement() => ProviderElement(this);

...
}

```


**Provide 與 Element的關聯**


這裡的 element 與三棵樹里的 element 並不相同，不過我認為取這個名稱也是有意義的，因為 Provider 本身就像是 Widget 一樣只是描述如何建立一個 State，Element 才是管理真正實際內容的地方。


**State 更新機制**


另一個有意思的地方，在每一個 ProvideElement 中，如果 state 被更改了了，有一個 `setState` 用 `_notifyListeners` 提醒訂閱者，也是和 Flutter 的 `setState` 相互呼應。


```dart
void setState(State newState) {
assert(
() {
_debugDidSetState = true;
return true;
}(),
'',
);
final previousResult = getState();
final result = _state = ResultData(newState);

if (_didBuild) {
_notifyListeners(result, previousResult);
}
}

```


**小總結**


現在我們先一起喘口氣，對目前為止的內容做一下小總結：


- `ProviderScope` 對 WidgetTree 注入 `ProviderContainer`

- `ProviderContainer` 掌管所有的 Provider state

- Provider 透過 `_createFn` 建立 `ProviderElement` 管理當前的狀態

- 透過 setState 去提醒所有訂閱 `ProviderElement` 的人 State 已經被更新


**Widget 與 ProviderElement 的連接**


深吸一口氣，我們一起來看最後一個關鍵，Widget 要怎麼跟 ProviderElement 串連起來，達到更新 Widget 的方法。


**ConsumerStatefulWidget 的角色**


那接下來的步驟，大家應該都猜到了吧！下一個要解剖的就是 `ConsumerStatefulWidget` 啦。你說為什麼不看 `ConsumerWidget` ? 因為 `ConsumerWidget` 也是繼承自 `ConsumerStatefulWidget` 🌝


```dart
abstract class ConsumerWidget extends ConsumerStatefulWidget {
...

```


那 `ConsumerStatefulWidget` 實際上做了什麼呢？他 override 了 createElement 的方法，替換成 `ConsumerStatefulElement`，以達到我們先前說的 `ProviderElement` 的注入。


```dart
abstract class ConsumerStatefulWidget extends StatefulWidget {
/// A [StatefulWidget] that can read providers.
const ConsumerStatefulWidget({super.key});

@override
// ignore: no_logic_in_create_state
ConsumerState createState();

@override
ConsumerStatefulElement createElement() {
return ConsumerStatefulElement(this);
}
}

```


另一點則是在 `_ConsumerState` 裡面放入 ref，作為我們可以拿來操作的對象，下一段會說明為什麼 `Buildcontext` 可以直接變成 `WidgetRef`


```dart
class _ConsumerState extends ConsumerState {
@override
WidgetRef get ref => context as WidgetRef;

@override
Widget build(BuildContext context) {
return widget.build(context, ref);
}
}

```


**WidgetRef 的定義與功能**


這裡可以看到 `ConsumerStatefulElement` 繼承了 `StatefulElement` 並實作 `WidgetRef`。我們知道 `StatefulElement` 是 `BuildContext` 的子類別，所以 `WidgetRef` 也是 `BuildContext` 的一個子類別的實現。


簡言之 `WidgetRef` 就是 `BuildContext` 的擴展，讓他可以勝任操作 watch, read 與 `ProviderContainer` 互動的功能。


```dart
/// The [Element] for a [ConsumerStatefulWidget]
class ConsumerStatefulElement extends StatefulElement implements WidgetRef {
/// The [Element] for a [ConsumerStatefulWidget]
ConsumerStatefulElement(ConsumerStatefulWidget super.widget);

late ProviderContainer _container = ProviderScope.containerOf(this);
...
}

```


所以我們可以看到在 `ConsumerStatefulElement` 在 `didChangeDependencies` 就會去重新讀取 `ProviderContainer`，以達到更新 Provider 內容的作用。


```dart
class ConsumerStatefulElement extends StatefulElement implements WidgetRef {
...
@override
void didChangeDependencies() {
super.didChangeDependencies();
final newContainer = ProviderScope.containerOf(this);
if (_container != newContainer) {
_container = newContainer;
for (final dependency in _dependencies.values) {
dependency.close();
}
_dependencies.clear();
}
}

```


至此大家應該對 Riverpod 如何透過 Element 達到串連 Widget 的效果有了初步的理解。這次的 Riverpod 解析也先告一段落，下次有機會再繼續展開！


# 結論


在本文中，我們深入探討了 Riverpod 狀態管理工具的核心概念與運作機制。透過對`ProviderContainer`、`Provider`、`ProviderElement`以及`ConsumerStatefulWidget`的解析，可以看出 Riverpod 是如何與 Flutter 的 Widget 系統結合，提供靈活且強大的狀態管理。


- **核心掌控**：`ProviderContainer`確實成為了狀態管理的核心，儲存且跟踪所有providers的狀態。

- **靈活性**：Riverpod提供的`ref.read`和`ref.watch`功能，使得開發者能夠輕鬆地查看和互動當前的provider狀態。

- **與 Flutter 的緊密結合**：透過`ConsumerStatefulWidget`和`ConsumerStatefulElement`，Riverpod 與 Flutter 建立了密切的聯繫，使得 Widgets 可以更加直觀地反映狀態變化。


希望你們喜歡今天的分享，明天繼續 🌝
