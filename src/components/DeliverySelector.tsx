import { MapPin, Store, Truck } from 'lucide-react';
import {
  DELIVERY_METHODS,
  LAGHOUAT_COMMUNES,
  STORE_INFO,
  type DeliveryMethodId,
} from '../data/products';
import {
  WILAYA_DELIVERY_RATES,
  findWilayaRate,
  formatWilayaLabel,
  getShippingFeeForWilaya,
  isLaghouatWilaya,
  isStopDeskAvailableForWilaya,
} from '../data/deliveryRates';
import { formatDzd, type OrderFormInput, type OrderValidationErrors } from '../utils/storeLogic';

interface DeliverySelectorProps {
  idPrefix: string;
  form: OrderFormInput;
  errors: OrderValidationErrors;
  onChangeForm: (updater: (prev: OrderFormInput) => OrderFormInput) => void;
  onClearErrors: (fields: Array<keyof OrderValidationErrors>) => void;
  hideOptionPrices?: boolean;
}

export function DeliverySelector({
  idPrefix,
  form,
  errors,
  onChangeForm,
  onClearErrors,
  hideOptionPrices = false,
}: DeliverySelectorProps) {
  const selectedWilayaRate = findWilayaRate(form.wilaya);
  const stopDeskAvailable = isStopDeskAvailableForWilaya(form.wilaya);
  const isLaghouat = isLaghouatWilaya(form.wilaya);

  const handleMethodSelect = (methodId: DeliveryMethodId) => {
    if (methodId === 'stop_desk' && !stopDeskAvailable) return;
    onChangeForm((prev) => ({
      ...prev,
      deliveryMethod: methodId,
      wilaya: prev.wilaya || formatWilayaLabel(selectedWilayaRate),
      commune:
        isLaghouatWilaya(prev.wilaya) && !prev.commune
          ? LAGHOUAT_COMMUNES[0]
          : prev.commune,
    }));
    onClearErrors(['wilaya', 'address', 'commune']);
  };

  const handleWilayaChange = (nextWilaya: string) => {
    const nextStopDeskOk = isStopDeskAvailableForWilaya(nextWilaya);
    const nextIsLaghouat = isLaghouatWilaya(nextWilaya);
    onChangeForm((prev) => ({
      ...prev,
      wilaya: nextWilaya,
      commune: nextIsLaghouat ? prev.commune || LAGHOUAT_COMMUNES[0] : '',
      deliveryMethod:
        prev.deliveryMethod === 'stop_desk' && !nextStopDeskOk
          ? 'home'
          : prev.deliveryMethod,
    }));
    onClearErrors(['wilaya', 'address', 'commune']);
  };

  return (
    <div className="space-y-4">
      <fieldset>
        <legend className="text-sm font-black text-[#18181B] mb-2.5">
          طريقة الاستلام والتوصيل ({STORE_INFO.deliveryPartner})
        </legend>
        <div className="space-y-2.5">
          {DELIVERY_METHODS.map((method) => {
            const isChecked =
              form.deliveryMethod === method.id ||
              (method.id === 'home' && form.deliveryMethod === 'laghouat');
            const isDisabled = method.id === 'stop_desk' && !stopDeskAvailable;
            const liveFee =
              method.id === 'pickup'
                ? 0
                : isDisabled
                  ? null
                  : getShippingFeeForWilaya(method.id, form.wilaya);

            const Icon =
              method.id === 'pickup' ? Store : method.id === 'stop_desk' ? MapPin : Truck;

            return (
              <label
                key={method.id}
                data-testid={`${idPrefix}-delivery-option-${method.id}`}
                className={`flex items-start justify-between gap-3 p-4 rounded-2xl border-2 transition-all ${
                  isDisabled
                    ? 'border-stone-200 bg-stone-50 opacity-60 cursor-not-allowed'
                    : isChecked
                      ? 'border-[#18181B] bg-[#FFD100]/15 shadow-[3px_3px_0px_#18181B] cursor-pointer'
                      : 'border-stone-300 hover:border-[#18181B] bg-white cursor-pointer shadow-2xs'
                }`}
              >
                <div className="flex items-start gap-3 min-w-0">
                  <input
                    type="radio"
                    name={`${idPrefix}-delivery-method`}
                    value={method.id}
                    checked={isChecked}
                    disabled={isDisabled}
                    onChange={() => handleMethodSelect(method.id)}
                    className="mt-1 accent-[#E30613] shrink-0 w-4 h-4"
                  />
                  <div className="min-w-0">
                    <p className="text-sm font-black text-[#18181B] flex items-center gap-1.5">
                      <Icon className="w-4 h-4 text-[#E30613] shrink-0" aria-hidden="true" />
                      <span>{method.title}</span>
                    </p>
                    <p className="mt-1 text-xs font-bold text-[#52525B] leading-relaxed">
                      {isDisabled
                        ? `الاستلام من المكتب غير متوفر في ولاية ${selectedWilayaRate.nameAr} — التوصيل للمنزل متوفر.`
                        : `${method.eta} · ${method.subtitle}`}
                    </p>
                  </div>
                </div>
                {!hideOptionPrices ? (
                  <span className="text-xs font-black text-[#18181B] tabular-nums whitespace-nowrap shrink-0 mt-0.5">
                    {liveFee === null
                      ? 'غير متوفر'
                      : liveFee === 0
                        ? 'مجاني'
                        : formatDzd(liveFee)}
                  </span>
                ) : null}
              </label>
            );
          })}
        </div>
      </fieldset>

      {form.deliveryMethod === 'pickup' ? (
        <div className="rounded-2xl bg-[#FAF9F6] border-2 border-stone-300 p-4 text-xs font-bold leading-relaxed text-[#52525B] space-y-1">
          <p className="font-black text-[#18181B]">عنوان الاستلام المباشر المجاني:</p>
          <p>{STORE_INFO.address}</p>
          <p className="text-stone-500">{STORE_INFO.hours}</p>
        </div>
      ) : (
        <div className="space-y-4 pt-1">
          {/* Wilaya Selector (69 Wilayas with live fee preview) */}
          <div>
            <label
              htmlFor={`${idPrefix}-wilaya`}
              className="block text-sm font-black text-[#18181B] mb-1.5"
            >
              الولاية (69 ولاية عبر ZR Express) <span className="text-[#E30613]">*</span>
            </label>
            <select
              id={`${idPrefix}-wilaya`}
              data-testid={`${idPrefix}-wilaya-select`}
              value={form.wilaya}
              onChange={(e) => handleWilayaChange(e.target.value)}
              className="w-full px-4 py-3 min-h-[46px] rounded-xl border-2 border-[#18181B] shadow-[2px_2px_0px_#18181B] text-sm font-bold bg-white focus:outline-none focus:shadow-[4px_4px_0px_#E30613] transition-all cursor-pointer"
            >
              {WILAYA_DELIVERY_RATES.map((rate) => {
                const label = formatWilayaLabel(rate);
                const feePreview =
                  form.deliveryMethod === 'stop_desk'
                    ? rate.stopDeskFeeDzd !== null
                      ? `مكتب: ${formatDzd(rate.stopDeskFeeDzd)}`
                      : `منزل فقط: ${formatDzd(rate.homeFeeDzd)}`
                    : `منزل: ${formatDzd(rate.homeFeeDzd)}`;
                return (
                  <option key={rate.code} value={label}>
                    {label} — {feePreview}
                  </option>
                );
              })}
            </select>
            {errors.wilaya ? (
              <p role="alert" className="mt-1.5 text-xs font-black text-[#E30613]">
                {errors.wilaya}
              </p>
            ) : null}
          </div>

          {/* Local Laghouat 24 Bureaus Selector when Wilaya 03 is chosen */}
          {isLaghouat ? (
            <div>
              <label
                htmlFor={`${idPrefix}-commune`}
                className="block text-sm font-black text-[#18181B] mb-1.5"
              >
                البلدية / المكتب داخل ولاية الأغواط
              </label>
              <select
                id={`${idPrefix}-commune`}
                data-testid={`${idPrefix}-commune-select`}
                value={form.commune || LAGHOUAT_COMMUNES[0]}
                onChange={(e) =>
                  onChangeForm((prev) => ({ ...prev, commune: e.target.value }))
                }
                className="w-full px-4 py-3 min-h-[46px] rounded-xl border-2 border-[#18181B] shadow-[2px_2px_0px_#18181B] text-sm font-bold bg-white focus:outline-none focus:shadow-[4px_4px_0px_#E30613] transition-all cursor-pointer"
              >
                {LAGHOUAT_COMMUNES.map((commune) => (
                  <option key={commune} value={commune}>
                    {commune}
                  </option>
                ))}
              </select>
            </div>
          ) : null}

          {/* Address Field (Required for Home Delivery, Optional info for Stop Desk) */}
          {form.deliveryMethod === 'stop_desk' ? (
            <div className="rounded-2xl bg-[#FAF9F6] border-2 border-stone-300 p-4 text-xs font-bold leading-relaxed text-[#52525B]">
              <p className="font-black text-[#18181B]">
                استلام من مكتب ZR Express — {selectedWilayaRate.nameAr}
              </p>
              <p className="mt-1">
                سيصلك إشعار أو اتصال عند وصول الطرد إلى مكتب ZR Express في{' '}
                <span className="font-black text-[#18181B]">
                  {isLaghouat && form.commune ? form.commune : selectedWilayaRate.nameAr}
                </span>
                . سعر التوصيل المعتمد:{' '}
                <span className="font-mono font-black text-[#E30613]">
                  {formatDzd(getShippingFeeForWilaya('stop_desk', form.wilaya))}
                </span>
                .
              </p>
            </div>
          ) : (
            <div>
              <label
                htmlFor={`${idPrefix}-address`}
                className="block text-sm font-black text-[#18181B] mb-1.5"
              >
                البلدية والعنوان الدقيق للتوصيل للمنزل <span className="text-[#E30613]">*</span>
              </label>
              <input
                id={`${idPrefix}-address`}
                data-testid={`${idPrefix}-address-input`}
                type="text"
                placeholder={
                  isLaghouat
                    ? 'الحي أو الشارع أو المعلم القريب (الأغواط)...'
                    : `البلدية والحي الدقيق في ولاية ${selectedWilayaRate.nameAr}...`
                }
                value={form.address}
                onChange={(e) => {
                  onChangeForm((prev) => ({ ...prev, address: e.target.value }));
                  onClearErrors(['address']);
                }}
                aria-invalid={Boolean(errors.address)}
                className={`w-full px-4 py-3 min-h-[46px] rounded-xl border-2 text-sm font-bold bg-white focus:outline-none transition-all ${
                  errors.address
                    ? 'border-[#E30613] shadow-[2px_2px_0px_#E30613]'
                    : 'border-[#18181B] shadow-[2px_2px_0px_#18181B] focus:shadow-[4px_4px_0px_#E30613]'
                }`}
              />
              {errors.address ? (
                <p role="alert" className="mt-1.5 text-xs font-black text-[#E30613]">
                  {errors.address}
                </p>
              ) : null}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
