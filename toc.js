// Populate the sidebar
//
// This is a script, and not included directly in the page, to control the total size of the book.
// The TOC contains an entry for each page, so if each page includes a copy of the TOC,
// the total size of the page becomes O(n**2).
class MDBookSidebarScrollbox extends HTMLElement {
    constructor() {
        super();
    }
    connectedCallback() {
        this.innerHTML = '<ol class="chapter"><li class="chapter-item expanded "><a href="day01.html"><strong aria-hidden="true">1.</strong> Day 1: 跟著我熟悉 Dart 3，這些高效語法你需要知道！</a></li><li class="chapter-item expanded "><a href="day02.html"><strong aria-hidden="true">2.</strong> Day 2: 使用 Dart 3 改善我們的開發習慣，更多範例與技巧分享！</a></li><li class="chapter-item expanded "><a href="day03.html"><strong aria-hidden="true">3.</strong> Day 3: 最熟悉的朋友 Flutter Widget，你會用但真的了解它嗎？</a></li><li class="chapter-item expanded "><a href="day04.html"><strong aria-hidden="true">4.</strong> Day 4: Flutter 高效核心，了解 Element 生命週期與使用</a></li><li class="chapter-item expanded "><a href="day05.html"><strong aria-hidden="true">5.</strong> Day 5: Flutter 的 StatefulWidget 和 State 生命週期，先熟悉它們再開發吧！</a></li><li class="chapter-item expanded "><a href="day06.html"><strong aria-hidden="true">6.</strong> Day 6: 完全掌握 Flutter APP 生命週期，跟著我從源碼認識它！</a></li><li class="chapter-item expanded "><a href="day07.html"><strong aria-hidden="true">7.</strong> Day 7: MediaQuery 是什麼？很方便但如何正確在 Flutter 使用，順便跟你說它的缺點</a></li><li class="chapter-item expanded "><a href="day08.html"><strong aria-hidden="true">8.</strong> Day 8: MediaQuery 優化後與 InheritedModel 如何進行指定更新</a></li><li class="chapter-item expanded "><a href="day09.html"><strong aria-hidden="true">9.</strong> Day 9: 深入 setState()，觀察它如何進行 UI 刷新！</a></li><li class="chapter-item expanded "><a href="day10.html"><strong aria-hidden="true">10.</strong> Day 10: Async 和 Isolates 差異在哪裡？正確使用才能確保流暢體驗！</a></li><li class="chapter-item expanded "><a href="day11.html"><strong aria-hidden="true">11.</strong> Day 11: Flutter 動畫大補帖，觀念與使用時機都告訴你！</a></li><li class="chapter-item expanded "><a href="day12.html"><strong aria-hidden="true">12.</strong> Day 12: 研究 Flutter 動畫，背後的 vsync 跟 Ticker 有多重要？</a></li><li class="chapter-item expanded "><a href="day13.html"><strong aria-hidden="true">13.</strong> Day 13: 在 Dart 與 Flutter 開發中常用的幾種 Pattern，為什麼需要它們？</a></li><li class="chapter-item expanded "><a href="day14.html"><strong aria-hidden="true">14.</strong> Day 14: Flutter 效能優化，良好的開發觀念與技巧！(上)</a></li><li class="chapter-item expanded "><a href="day15.html"><strong aria-hidden="true">15.</strong> Day 15: Flutter 效能優化，良好的開發觀念與技巧！(下)</a></li><li class="chapter-item expanded "><a href="day16.html"><strong aria-hidden="true">16.</strong> Day 16: 聊聊 Flutter 圖像使用的良好習慣，記憶體掌握與優化！</a></li><li class="chapter-item expanded "><a href="day17.html"><strong aria-hidden="true">17.</strong> Day 17: Riverpod 是什麼？它負責狀態管理嗎？跟著我了解幾個重要角色</a></li><li class="chapter-item expanded "><a href="day18.html"><strong aria-hidden="true">18.</strong> Day 18: Flutter 狀態管理？Riverpod 的 watch() 實際上如何通知更新？</a></li><li class="chapter-item expanded "><a href="day19.html"><strong aria-hidden="true">19.</strong> Day 19: 如何撰寫 Riverpod 測試，使用 Mocktail 來幫助我們吧！</a></li><li class="chapter-item expanded "><a href="day20.html"><strong aria-hidden="true">20.</strong> Day 20: Riverpod 的開發多元性以及日常使用技巧！Provider 該如何選擇？</a></li><li class="chapter-item expanded "><a href="day21.html"><strong aria-hidden="true">21.</strong> Day 21: 帶你完整探索 DevTools， Flutter Inspector 與 Performance 用法 (Debugging with DevTools - part1)</a></li><li class="chapter-item expanded "><a href="day22.html"><strong aria-hidden="true">22.</strong> Day 22: 帶你完整探索 DevTools，重要的 CPU Profiler、Memory 與 Logging (Debugging with DevTools - part2)</a></li><li class="chapter-item expanded "><a href="day23.html"><strong aria-hidden="true">23.</strong> Day 23: 帶你完整探索 DevTools，聰明的使用 Network、App Size Tool 與 Skia Tool (Debugging with DevTools - part3)</a></li><li class="chapter-item expanded "><a href="day24.html"><strong aria-hidden="true">24.</strong> Day 24: 善用工具與快捷輔助，提升 Flutter 開發效率！</a></li><li class="chapter-item expanded "><a href="day25.html"><strong aria-hidden="true">25.</strong> Day 25: 不要浪費時間在無聊代碼了，實作自己的模板生成工具，Mason Brick！</a></li><li class="chapter-item expanded "><a href="day26.html"><strong aria-hidden="true">26.</strong> Day 26: 想跑 Flutter 測試但卻不想寫嗎， 試看看 Maestro UI Testing， 整合 CICD 沒問題！</a></li><li class="chapter-item expanded "><a href="day27.html"><strong aria-hidden="true">27.</strong> Day 27: 什麼是 Atomic Design 與 Design System？從 Flutter 快速掌握它們！</a></li><li class="chapter-item expanded "><a href="day28.html"><strong aria-hidden="true">28.</strong> Day 28: 制訂品牌風格， Design System 讓製作畫面變得很有趣！</a></li><li class="chapter-item expanded "><a href="day29.html"><strong aria-hidden="true">29.</strong> Day 29: Dart 3 總複習，大家準備一下待會考試！</a></li><li class="chapter-item expanded "><a href="day30.html"><strong aria-hidden="true">30.</strong> Day 30: The End to Start, Be a Contributor</a></li><li class="chapter-item expanded "><a href="day31.html"><strong aria-hidden="true">31.</strong> Day 31：好想成為 Senior 工程師 🌝</a></li><li class="chapter-item expanded "><a href="day32.html"><strong aria-hidden="true">32.</strong> Day 32：什麼？你都在正式環境上開發！：Flutter Flavor 設定 🧄</a></li><li class="chapter-item expanded "><a href="day33.html"><strong aria-hidden="true">33.</strong> Day 33：蛤？又忘記上版了：Flutter CI/CD｜GitHub Action 1 🎬</a></li><li class="chapter-item expanded "><a href="day34.html"><strong aria-hidden="true">34.</strong> Day 34：驚！每次 PR 都要測試呀：Flutter CI/CD｜自動化測試｜GitHub Action 2 🎬</a></li><li class="chapter-item expanded "><a href="day35.html"><strong aria-hidden="true">35.</strong> Day 35：哇！雙平台真的很累人：Flutter CI/CD｜自動化部屬｜GitHub Action 3 🎬</a></li><li class="chapter-item expanded "><a href="day36.html"><strong aria-hidden="true">36.</strong> Day 36：呀！討厭不要偷看：Flutter monitor: Sentry log</a></li><li class="chapter-item expanded "><a href="day37.html"><strong aria-hidden="true">37.</strong> Day 37：Clean Architecture X Flutter (一)  | SOLID 🛁</a></li><li class="chapter-item expanded "><a href="day38.html"><strong aria-hidden="true">38.</strong> Day 38：Clean Architecture X Flutter（二）| Flutter 實踐篇 🛁</a></li><li class="chapter-item expanded "><a href="day39.html"><strong aria-hidden="true">39.</strong> Day 39：@@ 這個是什麼？｜Flutter MetaData</a></li><li class="chapter-item expanded "><a href="day40.html"><strong aria-hidden="true">40.</strong> Day 40：燚！揭秘 Source Gen｜Flutter 代碼生成</a></li><li class="chapter-item expanded "><a href="day41.html"><strong aria-hidden="true">41.</strong> Day 41：嗟乎！從外到內看 Flutter 渲染引擎｜Skia → Impeller</a></li><li class="chapter-item expanded "><a href="day42.html"><strong aria-hidden="true">42.</strong> Day 42：噫！從外到內看 Flutter 渲染引擎 2｜GLSL 與 Shader</a></li><li class="chapter-item expanded "><a href="day43.html"><strong aria-hidden="true">43.</strong> Day 43：嗚呼！提升 Flutter 安全性的七種方法｜Flutter Security</a></li><li class="chapter-item expanded "><a href="day44.html"><strong aria-hidden="true">44.</strong> Day 44：啊哈！提升 Flutter 安全性的第八種方法｜Flutter Security 2</a></li><li class="chapter-item expanded "><a href="day45.html"><strong aria-hidden="true">45.</strong> Day 45：Flutter 狀態管理：深入理解 Riverpod (上)</a></li><li class="chapter-item expanded "><a href="day46.html"><strong aria-hidden="true">46.</strong> Day 46：Flutter 狀態管理：深入理解 Riverpod (下)</a></li><li class="chapter-item expanded "><a href="day47.html"><strong aria-hidden="true">47.</strong> Day 47：Flutter Design Patterns（一）｜Structural  Patterns</a></li><li class="chapter-item expanded "><a href="day48.html"><strong aria-hidden="true">48.</strong> Day 48：Flutter Design Patterns（二）｜Behavioural Patterns 上集</a></li><li class="chapter-item expanded "><a href="day49.html"><strong aria-hidden="true">49.</strong> Day 49：Flutter Design Patterns（三）｜Behavioural Patterns 下集</a></li><li class="chapter-item expanded "><a href="day50.html"><strong aria-hidden="true">50.</strong> Day 50：來聊聊測試這件事（上）｜Flutter TDD</a></li><li class="chapter-item expanded "><a href="day51.html"><strong aria-hidden="true">51.</strong> Day 51：來聊聊測試這件事（中）｜Mock Package  的深入探索</a></li><li class="chapter-item expanded "><a href="day52.html"><strong aria-hidden="true">52.</strong> Day 52：來聊聊測試這件事（下）｜Golden Test 黃金傳說</a></li><li class="chapter-item expanded "><a href="day53.html"><strong aria-hidden="true">53.</strong> Day 53：發佈你的第一個 Package</a></li><li class="chapter-item expanded "><a href="day54.html"><strong aria-hidden="true">54.</strong> Day 54：原來還能這樣用 ！｜StoryBook 加速創作的方法</a></li><li class="chapter-item expanded "><a href="day55.html"><strong aria-hidden="true">55.</strong> Day 55：等等！我要進入 Zone 了｜Flutter 三大例外處理</a></li><li class="chapter-item expanded "><a href="day56.html"><strong aria-hidden="true">56.</strong> Day 56：Flutter Monorepo 探索之旅｜如何在大型項目中保持高效？Melos 告訴你</a></li><li class="chapter-item expanded "><a href="day57.html"><strong aria-hidden="true">57.</strong> Day 57：Flutter 優化的小細節｜RepaintBoundary 和 Event loop</a></li><li class="chapter-item expanded "><a href="day58.html"><strong aria-hidden="true">58.</strong> Day 58：Flutter  Flow 不是 FlutterFlow</a></li><li class="chapter-item expanded "><a href="day59.html"><strong aria-hidden="true">59.</strong> Day 59：Flutter 架構概覽｜前世與今生</a></li><li class="chapter-item expanded "><a href="day60.html"><strong aria-hidden="true">60.</strong> Day 60：鐵人賽心得反思｜如果下次還參加的話一定要回來看一下</a></li></ol>';
        // Set the current, active page, and reveal it if it's hidden
        let current_page = document.location.href.toString().split("#")[0].split("?")[0];
        if (current_page.endsWith("/")) {
            current_page += "index.html";
        }
        var links = Array.prototype.slice.call(this.querySelectorAll("a"));
        var l = links.length;
        for (var i = 0; i < l; ++i) {
            var link = links[i];
            var href = link.getAttribute("href");
            if (href && !href.startsWith("#") && !/^(?:[a-z+]+:)?\/\//.test(href)) {
                link.href = path_to_root + href;
            }
            // The "index" page is supposed to alias the first chapter in the book.
            if (link.href === current_page || (i === 0 && path_to_root === "" && current_page.endsWith("/index.html"))) {
                link.classList.add("active");
                var parent = link.parentElement;
                if (parent && parent.classList.contains("chapter-item")) {
                    parent.classList.add("expanded");
                }
                while (parent) {
                    if (parent.tagName === "LI" && parent.previousElementSibling) {
                        if (parent.previousElementSibling.classList.contains("chapter-item")) {
                            parent.previousElementSibling.classList.add("expanded");
                        }
                    }
                    parent = parent.parentElement;
                }
            }
        }
        // Track and set sidebar scroll position
        this.addEventListener('click', function(e) {
            if (e.target.tagName === 'A') {
                sessionStorage.setItem('sidebar-scroll', this.scrollTop);
            }
        }, { passive: true });
        var sidebarScrollTop = sessionStorage.getItem('sidebar-scroll');
        sessionStorage.removeItem('sidebar-scroll');
        if (sidebarScrollTop) {
            // preserve sidebar scroll position when navigating via links within sidebar
            this.scrollTop = sidebarScrollTop;
        } else {
            // scroll sidebar to current active section when navigating via "next/previous chapter" buttons
            var activeSection = document.querySelector('#sidebar .active');
            if (activeSection) {
                activeSection.scrollIntoView({ block: 'center' });
            }
        }
        // Toggle buttons
        var sidebarAnchorToggles = document.querySelectorAll('#sidebar a.toggle');
        function toggleSection(ev) {
            ev.currentTarget.parentElement.classList.toggle('expanded');
        }
        Array.from(sidebarAnchorToggles).forEach(function (el) {
            el.addEventListener('click', toggleSection);
        });
    }
}
window.customElements.define("mdbook-sidebar-scrollbox", MDBookSidebarScrollbox);
