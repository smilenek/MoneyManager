import SwiftUI
import WebKit
import WidgetKit

// Configure the HTTPS address and registered App Group before building.
enum CapMoneyConfiguration {
    static let appGroup = "group.com.example.capmoney"
}

@main
struct CapMoneyApp: App {
    @AppStorage("siteURL") private var siteURL = ""
    var body: some Scene {
        WindowGroup {
            if let url = URL(string: siteURL), url.scheme == "https", url.host != nil {
                CapMoneyWebView(url: url)
            } else {
                VStack(spacing: 20) {
                    Text("CapMoney").font(.largeTitle.bold())
                    Text("Nhập địa chỉ HTTPS của CapMoney đã triển khai.")
                    TextField("https://…", text: $siteURL)
                        .textInputAutocapitalization(.never).autocorrectionDisabled()
                        .textFieldStyle(.roundedBorder)
                }.padding()
            }
        }
    }
}

struct CapMoneyWebView: UIViewRepresentable {
    let url: URL
    func makeCoordinator() -> Coordinator { Coordinator(origin: url) }
    func makeUIView(context: Context) -> WKWebView {
        let configuration = WKWebViewConfiguration()
        configuration.allowsInlineMediaPlayback = true
        configuration.userContentController.add(context.coordinator, name: "summary")
        let view = WKWebView(frame: .zero, configuration: configuration)
        view.navigationDelegate = context.coordinator
        view.load(URLRequest(url: url))
        return view
    }
    func updateUIView(_ view: WKWebView, context: Context) {}
    static func dismantleUIView(_ view: WKWebView, coordinator: Coordinator) {
        view.configuration.userContentController.removeScriptMessageHandler(forName: "summary")
    }
    final class Coordinator: NSObject, WKScriptMessageHandler, WKNavigationDelegate {
        let origin: URL
        init(origin: URL) { self.origin = origin }
        func userContentController(_ userContentController: WKUserContentController, didReceive message: WKScriptMessage) {
            guard message.frameInfo.isMainFrame,
                  message.frameInfo.securityOrigin.host == origin.host,
                  message.frameInfo.securityOrigin.protocol == "https",
                  let payload = message.body as? [String: Any],
                  JSONSerialization.isValidJSONObject(payload),
                  let data = try? JSONSerialization.data(withJSONObject: payload),
                  let defaults = UserDefaults(suiteName: CapMoneyConfiguration.appGroup) else { return }
            defaults.set(data, forKey: "summary")
            WidgetCenter.shared.reloadTimelines(ofKind: "CapMoneySummary")
        }
        func webView(_ webView: WKWebView, decidePolicyFor action: WKNavigationAction, decisionHandler: @escaping (WKNavigationActionPolicy) -> Void) {
            guard let destination = action.request.url else { decisionHandler(.cancel); return }
            if destination.host == origin.host && destination.scheme == "https" { decisionHandler(.allow) }
            else { decisionHandler(.cancel); if action.navigationType == .linkActivated { UIApplication.shared.open(destination) } }
        }
    }
}
