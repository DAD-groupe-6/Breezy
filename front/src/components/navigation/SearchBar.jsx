"use client"

import { useId, useState } from 'react'
import { FiSearch } from 'react-icons/fi'

export default function Searchbar({
	id,
	value,
	defaultValue = '',
	onChange,
	placeholder = 'Search...',
	className = '',
	rounded = 'rounded-2xl',
	inputClassName = '',
	iconClassName = '',
	ariaLabel = 'Search',
}) {
	const generatedId = useId()
	const [internalValue, setInternalValue] = useState(defaultValue)
	const isControlled = value !== undefined
	const inputValue = isControlled ? value : internalValue

	const handleChange = (event) => {
		if (!isControlled) {
			setInternalValue(event.target.value)
		}

		onChange?.(event)
	}

	return (
		<div
			className={`flex items-center gap-3 border border-[var(--color-border)] bg-[var(--color-bg-surface-2)] px-4 py-3 transition-colors focus-within:border-[var(--color-text-title)] focus-within:ring-2 focus-within:ring-[var(--color-text-title)]/20 ${rounded} ${className}`}
		>
			<FiSearch className={`shrink-0 text-lg text-[var(--color-text-secondary)] ${iconClassName}`} aria-hidden="true" />
			<input
				id={id ?? generatedId}
				type="search"
				value={inputValue}
				onChange={handleChange}
				placeholder={placeholder}
				aria-label={ariaLabel}
				className={`w-full bg-transparent text-sm text-[var(--color-text-primary)] outline-none placeholder:text-[var(--color-text-secondary)] ${inputClassName}`}
			/>
		</div>
	)
}
