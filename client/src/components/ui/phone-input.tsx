import * as React from "react";
import { Check, ChevronsUpDown, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { countries } from "@/lib/countries";

interface PhoneInputProps {
    value?: string;
    onChange: (value: string) => void;
    placeholder?: string;
    className?: string;
    style?: React.CSSProperties;
    error?: boolean;
}

export function PhoneInputWithCountry({
    value = "",
    onChange,
    placeholder = "Enter phone number...",
    className,
    style,
    error,
}: PhoneInputProps) {
    const [open, setOpen] = React.useState(false);

    // Parse initial value: e.g. "+91 9876543210"
    const initialDialCode = value.startsWith("+") ? value.split(" ")[0] : "+91";
    const initialNumber = value.includes(" ") ? value.split(" ").slice(1).join(" ") : (value.startsWith("+") ? "" : value);

    const [selectedCountry, setSelectedCountry] = React.useState(
        countries.find((c) => c.dialCode === initialDialCode) || countries.find(c => c.iso2 === "IN") || countries[0]
    );

    const [phoneNumber, setPhoneNumber] = React.useState(initialNumber);

    React.useEffect(() => {
        // Sync if external value changes (simplified)
        if (value && value !== `${selectedCountry.dialCode} ${phoneNumber}`) {
            const parts = value.split(" ");
            if (parts.length >= 2 && parts[0].startsWith("+")) {
                const country = countries.find(c => c.dialCode === parts[0]);
                if (country) {
                    setSelectedCountry(country);
                    setPhoneNumber(parts.slice(1).join(" "));
                }
            }
        }
    }, [value]);

    const handleCountrySelect = (country: typeof countries[0]) => {
        setSelectedCountry(country);
        setOpen(false);
        onChange(`${country.dialCode} ${phoneNumber}`);
    };

    const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        // Allow digits, spaces, -, (, )
        if (/^[0-9+\-()\s]*$/.test(val)) {
            setPhoneNumber(val);
            onChange(`${selectedCountry.dialCode} ${val}`);
        }
    };

    const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
        const paste = e.clipboardData.getData("text");
        const digitsOnly = paste.replace(/[^0-9+\-()\s]/g, "");
        if (digitsOnly !== paste) {
            e.preventDefault();
            const newValue = phoneNumber + digitsOnly;
            setPhoneNumber(newValue);
            onChange(`${selectedCountry.dialCode} ${newValue}`);
        }
    };

    return (
        <div
            className={cn(
                "flex h-12 w-full items-center rounded-2xl border bg-white transition-all focus-within:ring-4 overflow-hidden",
                error ? "border-mongodb-error focus-within:ring-mongodb-error/10" : "border-mongodb-border-slate/60 focus-within:ring-mongodb-green/20",
                className
            )}
            style={style}
        >
            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <Button
                        variant="ghost"
                        role="combobox"
                        aria-expanded={open}
                        className="h-full w-[100px] gap-1 px-3 border-none rounded-none hover:bg-mongodb-light-slate/10 flex items-center justify-between shrink-0 font-bold text-mongodb-deep-slate"
                    >
                        <span className="flex items-center gap-2 overflow-hidden">
                            <span className="text-lg leading-none">{selectedCountry.flag}</span>
                            <span className="text-xs truncate">{selectedCountry.dialCode}</span>
                        </span>
                        <ChevronsUpDown className="h-3 w-3 opacity-50 shrink-0" />
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[300px] p-0 rounded-2xl shadow-2xl border-mongodb-border-slate/100 overflow-hidden" align="start">
                    <Command className="rounded-none">
                        <CommandInput placeholder="Search country..." className="h-10 text-xs border-none focus:ring-0" />
                        <CommandList className="max-h-[300px]">
                            <CommandEmpty>No country found.</CommandEmpty>
                            <CommandGroup>
                                {countries.map((country) => (
                                    <CommandItem
                                        key={country.iso2}
                                        value={`${country.name} ${country.dialCode}`}
                                        onSelect={() => handleCountrySelect(country)}
                                        className="flex items-center justify-between py-2.5 px-3 cursor-pointer hover:bg-mongodb-light-slate/20 transition-colors"
                                    >
                                        <div className="flex items-center gap-3">
                                            <span className="text-lg leading-none">{country.flag}</span>
                                            <span className="text-xs font-medium text-mongodb-deep-slate">{country.name}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-[10px] font-black text-mongodb-slate-text/60">{country.dialCode}</span>
                                            {selectedCountry.iso2 === country.iso2 && (
                                                <Check className="h-3 w-3 text-mongodb-green" />
                                            )}
                                        </div>
                                    </CommandItem>
                                ))}
                            </CommandGroup>
                        </CommandList>
                    </Command>
                </PopoverContent>
            </Popover>

            <div className="h-6 w-px bg-mongodb-border-slate/40 shrink-0" />

            <Input
                type="tel"
                value={phoneNumber}
                onChange={handlePhoneChange}
                onPaste={handlePaste}
                placeholder={placeholder}
                className="flex-1 h-full border-none rounded-none focus-visible:ring-0 px-4 font-bold text-mongodb-deep-slate bg-transparent placeholder:text-mongodb-slate-text/30 placeholder:font-medium"
            />
        </div>
    );
}
