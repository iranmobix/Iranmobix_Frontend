type ProductDataFeedbackProps = {
  isError: boolean;
  isMock: boolean;
  isFetching: boolean;
  onUseMock: () => void;
  onUseApi: () => void;
};

const ProductDataFeedback = ({
  isError,
  isMock,
  isFetching,
  onUseMock,
  onUseApi,
}: ProductDataFeedbackProps) => {
  if (!isError && !isMock) return null;
  return (
    <div
      role={isError ? "alert" : "status"}
      className="mb-4 space-y-3 rounded-lg border border-primary-100 bg-white p-4 text-sm text-neutral-700"
    >
      <p>
        {isError
          ? isMock
            ? "دریافت دادهٔ نمونه ناموفق بود."
            : "دریافت یا پردازش اطلاعات از بک ناموفق بود."
          : "در حال نمایش دادهٔ نمونه هستید. این داده‌ها لزوماً مربوط به محصول یا فیلترهای انتخاب‌شده نیستند."}
      </p>
      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          disabled={isFetching}
          onClick={onUseApi}
          className="rounded-md border border-primary-300 px-4 py-2 text-primary-700 disabled:opacity-50"
        >
          {isMock ? "دریافت دوباره از بک" : "تلاش دوباره"}
        </button>
        {isError && !isMock && (
          <button
            type="button"
            disabled={isFetching}
            onClick={onUseMock}
            className="rounded-md bg-primary-700 px-4 py-2 text-white disabled:opacity-50"
          >
            نمایش دادهٔ نمونه
          </button>
        )}
      </div>
    </div>
  );
};

export default ProductDataFeedback;
