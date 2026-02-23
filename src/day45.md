# Day 45：Flutter 狀態管理：深入理解 Riverpod (上)

> 原文來源：[Day 15：Flutter 狀態管理：深入理解 Riverpod (上)](https://ithelp.ithome.com.tw/articles/10331828)

Flutter 在開發之初，並沒有一個完美的狀態管理解決方案。於是各路民間大神，從過往的軟體開發中提出了很多不同的解決方案。我在過往參與過的專案中，就經歷過 Bloc, Redux, GetX 和 Provide 每一個都有他的好與壞，但是都沒有今天要介紹的 Riverpod 讓人著迷。


### Riverpod 是什麼 ?


Riverpod 其實是 Provider 的字母重組，從這裡你就可以看出 Riverpod 與 Provider 的淵源。沒錯！他們是由相同的開發者 （Rémi Rousselet）所維護的。那相對於 Provider Riverpod 提供了哪些額外的好處？


這裡順便推薦一下 Rémi Rousselet 的 [X](https://twitter.com/remi_rousselet?lang=zh-Hant) 帳號，他對 Flutter 社群有著巨大的貢獻，常常也會發表一些 Flutter 的小 tips 。


**解耦 BuildContext**


Riverpod 最明顯的特點就是他移除了對 BuildContext 的依賴，這對開發者來說是個天大的好消息，我們終於可以好好的分開邏輯與 UI ，並且可以更輕鬆地去做任何的測試，而不用擔心 BuildContext 的問題。


因為解決了上述的問題 Riverpod 完全可以勝任 Singletons、Service Locators 或者 InheritedWidgets 等模式，讓我們省去很多麻煩。


**輕鬆結合多種狀態**


在很多開發上，可能在一個狀態的按鈕，需要同時聆聽多個狀態。舉個例子，一個登入按鈕就同時需要檢查 網路狀態、密碼長度、必填欄位，在其他狀態管理方法上，要統合這些狀態非常困難，但是 Riverpod 提供了很好的結合狀態的方法。


```dart
final filedState = StateProvider((ref) => false);
final networkState = StateProvider((ref) => false);
final passwordFieldState = StateProvider((ref) => false);

final loginState = StateProvider((ref) {
final filed = ref.watch(filedState);
final network = ref.watch(networkState);
final password = ref.watch(passwordFieldState);
return filed && network && password;
});

```


由於網路上已經有許多關於 Riverpod 用法的文章，這裡就不做過多贅述，我們馬上來看看 Riverpod 是如何幫我們實現這些方便的功能！


在要使用 Riverpod 時，常見的做法是先套上 ProviderScope。


```dart

void main() {
runApp(
const ProviderScope(
child: MyApp(),
),
);
}

```


當要把 ProviderScope 套到 WidgetTree 最頂端的時候，相信一些敏銳的同學已經察覺到了，這件事肯定跟 `InheritedWidget` 脫離不了關係。那 `ProviderScope`究竟是什麼呢？我們一起來看一下原始碼：


```dart

@sealed
class ProviderScope extends StatefulWidget {
/// {@macro riverpod.providerscope}
const ProviderScope({
super.key,
this.overrides = const [],
this.observers,
this.parent,
required this.child,
});

/// Read the current [ProviderContainer] for a [BuildContext].
static ProviderContainer containerOf(
BuildContext context, {
bool listen = true,
}) {
UncontrolledProviderScope? scope;

if (listen) {
scope = context //
.dependOnInheritedWidgetOfExactType();
} else {
scope = context
.getElementForInheritedWidgetOfExactType()
?.widget as UncontrolledProviderScope?;
}

if (scope == null) {
throw StateError('No ProviderScope found');
}

return scope.container;
}

final ProviderContainer? parent;

/// The part of the widget tree that can use Riverpod and has overridden providers.
final Widget child;

/// The listeners that subscribes to changes on providers stored on this [ProviderScope].
final List? observers;

/// Information on how to override a provider/family.
final List overrides;

@override
ProviderScopeState createState() => ProviderScopeState();
}

/// Do not use: The [State] of [ProviderScope]
@visibleForTesting
@sealed
@internal
class ProviderScopeState extends State {
/// The [ProviderContainer] exposed to [ProviderScope.child].
@visibleForTesting
// ignore: diagnostic_describe_all_properties
late final ProviderContainer container;
ProviderContainer? _debugParentOwner;
var _dirty = false;

@override
void initState() {
super.initState();

final parent = _getParent();
assert(
() {
_debugParentOwner = parent;
return true;
}(),
'',
);

container = ProviderContainer(
parent: parent,
overrides: widget.overrides,
observers: widget.observers,
);
}

ProviderContainer? _getParent() {
if (widget.parent != null) {
return widget.parent;
} else {
final scope = context
.getElementForInheritedWidgetOfExactType()
?.widget as UncontrolledProviderScope?;

return scope?.container;
}
}

@override
void didUpdateWidget(ProviderScope oldWidget) {
super.didUpdateWidget(oldWidget);
_dirty = true;

if (oldWidget.parent != widget.parent) {
FlutterError.reportError(
FlutterErrorDetails(
library: 'flutter_riverpod',
exception: UnsupportedError(
'Changing ProviderScope.parent is not supported',
),
context: ErrorDescription('while rebuilding ProviderScope'),
),
);
}
}

@override
Widget build(BuildContext context) {
assert(
() {
if (widget.parent != null) {
// didUpdateWidget already takes care of widget.parent change
return true;
}
final parent = _getParent();

if (parent != _debugParentOwner) {
throw UnsupportedError(
'ProviderScope was rebuilt with a different ProviderScope ancestor',
);
}
return true;
}(),
'',
);
if (_dirty) {
_dirty = false;
container.updateOverrides(widget.overrides);
}

return UncontrolledProviderScope(
container: container,
child: widget.child,
);
}

@override
void dispose() {
container.dispose();
super.dispose();
}
}


```


原來 ProviderScope 也只是一個 StatefulWidget 並且包裹了一個 `UncontrollerProviderScope`，秉持小偵探的精深，我們繼續往下挖一下：


```dart
@sealed
class UncontrolledProviderScope extends InheritedWidget {
/// {@macro riverpod.UncontrolledProviderScope}
const UncontrolledProviderScope({
super.key,
required this.container,
required super.child,
});

/// The [ProviderContainer] exposed to the widget tree.
final ProviderContainer container;

@override
bool updateShouldNotify(UncontrolledProviderScope oldWidget) {
return container != oldWidget.container;
}

@override
// ignore: library_private_types_in_public_api
_UncontrolledProviderScopeElement createElement() {
return _UncontrolledProviderScopeElement(this);
}
}

```


果然罪證確鑿，是一個 `InheritedWidget`，符合我們最一開始的猜測，在這個 `InheritedWidget` 中，我們希望流傳下去的就是 `ProviderContainer`，`ProviderContainer` 就相當於是整個 Riverpod 系統中的心臟，負責記憶各種的 Provider State。至此，我們就可以知道為什麼 Riverpod 不依賴 BuildContext，因為他是透過 `ProviderContainer` 去記錄當前狀態。而 `ProviderScope` 是讓 Widget 方便讀取 `ProviderContainer` 的工具。


## 小結


今天我們了解了 ProviderScope 是如何工作的，明天來繼續講解 ProviderContainer 又扮演了什麼樣的角色！敬請期待
