export interface CourierInfo {
  name: string;
  trackUrl: (trackingId: string) => string;
}

export const COURIERS: Record<string, CourierInfo> = {
  india_post:   { name: 'India Post',           trackUrl: (id) => `https://www.indiapost.gov.in/_layouts/15/DOP.Portal.Tracking/TrackConsignment.aspx?TrackNo=${id}` },
  delhivery:    { name: 'Delhivery',            trackUrl: (id) => `https://www.delhivery.com/tracking/?val=${id}` },
  bluedart:     { name: 'BlueDart',             trackUrl: (id) => `https://www.bluedart.com/tracking?TrackNos=${id}` },
  dtdc:         { name: 'DTDC',                 trackUrl: (id) => `https://www.dtdc.in/tracking/tracking_results.asp?Consignment=${id}` },
  ekart:        { name: 'Ekart',                trackUrl: (id) => `https://ekartlogistics.com/track/${id}` },
  xpressbees:   { name: 'Xpressbees',           trackUrl: (id) => `https://www.xpressbees.com/shipment/tracking?awbNo=${id}` },
  fedex:        { name: 'FedEx',                trackUrl: (id) => `https://www.fedex.com/fedextrack/?trknbr=${id}` },
  professional: { name: 'Professional Courier', trackUrl: (id) => `https://www.tpcindia.com/tracking.aspx?id=${id}` },
  other:        { name: 'Other Courier',        trackUrl: (id) => `https://t.17track.net/en#nums=${id}` },
};

export const COURIER_OPTIONS = Object.entries(COURIERS).map(([value, { name }]) => ({ value, name }));

export function getCourierTrackUrl(courierService: string | undefined, trackingNumber: string): string | null {
  if (!courierService || !trackingNumber) return null;
  return COURIERS[courierService]?.trackUrl(trackingNumber) ?? `https://t.17track.net/en#nums=${trackingNumber}`;
}

export function getCourierName(courierService: string | undefined): string {
  if (!courierService) return 'Courier';
  return COURIERS[courierService]?.name ?? courierService;
}
