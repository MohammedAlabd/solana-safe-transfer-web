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
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Get a Confirmation Code
        </button>
      </div>
    </div>
  );
}
