type Props = {
  onInitiate: () => void;
  isLoading: boolean;
};

export default function InitiateAccount({ onInitiate, isLoading }: Props) {
  return (
    <div className="">
      <h1>{isLoading}</h1>
      <div>
        <button
          onClick={onInitiate}
          disabled={isLoading}
          className="rounded bg-blue-500 px-4 py-2 font-bold text-white hover:bg-blue-700"
        >
          Get a Confirmation Code
        </button>
      </div>
    </div>
  );
}
