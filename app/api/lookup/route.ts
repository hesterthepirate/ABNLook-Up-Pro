import { NextRequest, NextResponse } from "next/server";

const ABR_GUID = "361eb945-6e2f-4bea-baf5-7f68ee24eb97";

function parseXml(xml: string, tag: string): string {
  const match = xml.match(new RegExp(`<${tag}[^>]*>([^<]*)</${tag}>`));
  return match ? match[1].trim() : "";
}

export async function GET(request: NextRequest) {
  const abn = request.nextUrl.searchParams.get("abn")?.replace(/\s/g, "");

  if (!abn || !/^\d{11}$/.test(abn)) {
    return NextResponse.json({ error: "Enter a valid 11-digit ABN" }, { status: 400 });
  }

  try {
    const url = `https://abr.business.gov.au/abrxmlsearch/AbrXmlSearch.asmx/ABRSearchByABN?searchString=${abn}&includeHistoricalDetails=N&authenticationGuid=${ABR_GUID}`;
    const res = await fetch(url, { next: { revalidate: 3600 } });
    const xml = await res.text();

    const entityName =
      parseXml(xml, "organisationName") ||
      parseXml(xml, "fullName") ||
      [parseXml(xml, "givenName"), parseXml(xml, "familyName")].filter(Boolean).join(" ");
    const abnStatus = parseXml(xml, "entityStatusCode");
    const gstFrom = parseXml(xml, "effectiveFrom");
    const entityType = parseXml(xml, "entityDescription");
    const postcode = parseXml(xml, "postcode");
    const state = parseXml(xml, "stateCode");

    if (!entityName && !abnStatus) {
      return NextResponse.json({ error: "ABN not found" }, { status: 404 });
    }

    return NextResponse.json({
      abn,
      entityName,
      abnStatus,
      entityType,
      gstFrom: gstFrom || null,
      location: [postcode, state].filter(Boolean).join(" "),
    });
  } catch (err) {
    return NextResponse.json({ error: "ABR lookup failed" }, { status: 500 });
  }
}
