const InputField = ({ label, name, type = "text", placeholder, value, onChange, onKeyDown, icon: Icon, error }) => {
  return (
    <div className="w-full">
      <label className="mb-2 block text-sm font-medium text-text">{label}</label>

      <div className="relative">
        {Icon && <Icon size={18} className="absolute left-4 top-3.5 text-text-muted" />}

        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          onKeyDown={onKeyDown}
          placeholder={placeholder}
          className={`
            w-full
            rounded-xl
            border
            ${error ? "border-red-500 focus:border-red-500" : "border-border focus:border-primary"}
            bg-background
            py-3
            text-text
            outline-none
            transition-all
            duration-200
            placeholder:text-text-muted
            focus:ring-2
            focus:ring-primary/20
            ${Icon ? "pl-11 pr-4" : "px-4"}
          `}
        />
      </div>

      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
    </div>
  );
};

export default InputField;
