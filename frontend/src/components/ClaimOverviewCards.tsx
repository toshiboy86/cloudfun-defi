interface ClaimOverviewCardsProps {
  availableToClaim: string;
  interestEarned: string;
  fundingFans: string;
  yourClaimTokens: string;
}

export function ClaimOverviewCards({
  availableToClaim,
  interestEarned,
  fundingFans,
  yourClaimTokens,
}: ClaimOverviewCardsProps) {
  return (
    <>
      {/* Claim Overview Cards */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-emerald-50 p-6 rounded-2xl shadow-lg border border-emerald-200">
          <div className="flex items-center space-x-3 mb-3">
            <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
              <svg
                className="w-5 h-5 text-emerald-600"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div>
              <p className="text-sm text-emerald-700 font-medium">
                Available to Claim
              </p>
              <p className="text-2xl font-bold text-emerald-900">
                {availableToClaim}
              </p>
              <p className="text-xs text-emerald-600 mt-1">
                Collected by your fans - ready for withdrawal
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-lg">
          <div className="flex items-center space-x-3 mb-3">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <svg
                className="w-5 h-5 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                />
              </svg>
            </div>
            <div>
              <p className="text-sm text-gray-500">Interest Earned</p>
              <p className="text-2xl font-bold text-gray-900">
                {interestEarned}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Claim Status Cards */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white p-6 rounded-2xl shadow-lg">
          <div className="flex items-center space-x-3 mb-3">
            <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
              <svg
                className="w-5 h-5 text-amber-600"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-gray-500">Funding Fans</p>
              <p className="text-2xl font-bold text-gray-900">{fundingFans}</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
