import { NextRequest, NextResponse } from "next/server";

function extract(html: string, label: string): string {
  const re = new RegExp(label + ".*?<td>(.*?)</td>", "s");
  const match = html.match(re);
  if (!match) return "";
  return match[1].replace(/<[^>]+>/g, "").replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").trim();
}

export async function GET(request: NextRequest) {
  const abn = request.nextUrl.searchParams.get("abn")?.replace(/\s/g, "");

  if (!abn || !/^\d{11}$/.test(abn)) {
    return NextResponse.json({ error: "Enter a valid 11-digit ABN" }, { status: 400 });
  }

  try {
    const res = await fetch(`https://abr.business.gov.au/ABN/View?abn=${abn}`, {
      headers: { "User-Agent": "ABNLookupPro/1.0" },
      next: { revalidate: 3600 },
    });
    const html = await res.text();

    if (html.includes("No records found") || html.includes("is not a valid ABN")) {
      return NextResponse.json({ error: "ABN not found" }, { status: 404 });
    }

    const entityName = extract(html, "Entity name");
    const abnStatus = extract(html, "ABN status");
    const gstRegistered = extract(html, "Goods & Services Tax") || extract(html, "Goods &amp; Services Tax");
    const entityType = extract(html, "Entity type");
    const location = extract(html, "State") || extract(html, "Location");

    if (!entityName) {
      return NextResponse.json({ error: "Could not parse ABN details" }, { status: 500 });
    }

    return NextResponse.json({
      abn,
      entityName,
      abnStatus: abnStatus.includes("Active") ? "Active" : abnStatus.includes("Cancelled") ? "Cancelled" : abnStatus,
      gstRegistered: gstRegistered || null,
      gstCancelledDate: null,
    });
  } catch (err) {
    return NextResponse.json({ error: "ABR lookup failed" }, { status: 500 });
  }
}
