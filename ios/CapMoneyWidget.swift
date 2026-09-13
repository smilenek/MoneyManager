import SwiftUI
import WidgetKit

struct MoneyEntry: TimelineEntry {
    let date: Date
    let expense: Double
    let income: Double
    let updated: String
}
struct MoneyProvider: TimelineProvider {
    func placeholder(in context: Context) -> MoneyEntry { MoneyEntry(date: Date(), expense: 0, income: 0, updated: "Chưa cập nhật") }
    func read() -> MoneyEntry {
        let data = UserDefaults(suiteName: "group.com.example.capmoney")?.data(forKey: "summary")
        let values = data.flatMap { try? JSONSerialization.jsonObject(with: $0) as? [String: Any] } ?? [:]
        return MoneyEntry(date: Date(), expense: values["expense"] as? Double ?? 0, income: values["income"] as? Double ?? 0, updated: values["updated"] as? String ?? "Mở ứng dụng để cập nhật")
    }
    func getSnapshot(in context: Context, completion: @escaping (MoneyEntry) -> Void) { completion(read()) }
    func getTimeline(in context: Context, completion: @escaping (Timeline<MoneyEntry>) -> Void) {
        completion(Timeline(entries: [read()], policy: .after(Date().addingTimeInterval(3600))))
    }
}
struct MoneyWidgetView: View {
    let entry: MoneyEntry
    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            Text("CapMoney").font(.headline).foregroundStyle(.blue)
            Text("Chi tiêu").font(.caption)
            Text(entry.expense, format: .currency(code: "VND").precision(.fractionLength(0)))
                .font(.title2.bold()).foregroundStyle(.red).minimumScaleFactor(0.6).privacySensitive()
            Text("Thu: \(entry.income.formatted(.currency(code: "VND").precision(.fractionLength(0))))")
                .font(.caption).foregroundStyle(.green).privacySensitive()
            Text(entry.updated).font(.caption2).foregroundStyle(.secondary)
        }.containerBackground(.black.gradient, for: .widget)
    }
}
@main
struct CapMoneyWidget: Widget {
    var body: some WidgetConfiguration {
        StaticConfiguration(kind: "CapMoneySummary", provider: MoneyProvider()) { entry in MoneyWidgetView(entry: entry) }
            .configurationDisplayName("Thu chi CapMoney")
            .description("Số liệu từ lần mở CapMoney gần nhất.")
            .supportedFamilies([.systemSmall, .systemMedium])
    }
}
