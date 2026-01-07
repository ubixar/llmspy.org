'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';

interface SystemPrompt {
    id: string;
    name: string;
    value: string;
}

interface SystemPromptsProps {
    className?: string;
}

const ITEMS_PER_PAGE = 12;

export function SystemPrompts({ className }: SystemPromptsProps) {
    const [prompts, setPrompts] = useState<SystemPrompt[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedPrompt, setSelectedPrompt] = useState<SystemPrompt | null>(null);
    const [copiedId, setCopiedId] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/data/prompts.json')
            .then(res => res.json())
            .then(data => {
                setPrompts(data);
                setLoading(false);
            })
            .catch(error => {
                console.error('Error loading prompts:', error);
                setLoading(false);
            });
    }, []);

    const filteredPrompts = useMemo(() => {
        if (!searchQuery.trim()) return prompts;

        const query = searchQuery.toLowerCase();
        return prompts.filter(prompt =>
            prompt.name.toLowerCase().includes(query) ||
            prompt.id.toLowerCase().includes(query) ||
            prompt.value.toLowerCase().includes(query)
        );
    }, [prompts, searchQuery]);

    const totalPages = Math.ceil(filteredPrompts.length / ITEMS_PER_PAGE);

    const paginatedPrompts = useMemo(() => {
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        const endIndex = startIndex + ITEMS_PER_PAGE;
        return filteredPrompts.slice(startIndex, endIndex);
    }, [filteredPrompts, currentPage]);

    // Reset to page 1 when search changes
    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery]);

    const openModal = useCallback((prompt: SystemPrompt) => {
        setSelectedPrompt(prompt);
        document.body.style.overflow = 'hidden';
    }, []);

    const closeModal = useCallback(() => {
        setSelectedPrompt(null);
        document.body.style.overflow = '';
    }, []);

    const navigatePrompt = useCallback((direction: 'prev' | 'next') => {
        if (!selectedPrompt) return;

        const currentIndex = filteredPrompts.findIndex(p => p.id === selectedPrompt.id);
        if (currentIndex === -1) return;

        const newIndex = direction === 'prev' ? currentIndex - 1 : currentIndex + 1;
        if (newIndex >= 0 && newIndex < filteredPrompts.length) {
            setSelectedPrompt(filteredPrompts[newIndex]);
        }
    }, [selectedPrompt, filteredPrompts]);

    const copyToClipboard = useCallback((text: string, id: string) => {
        navigator.clipboard.writeText(text).then(() => {
            setCopiedId(id);
            setTimeout(() => setCopiedId(null), 2000);
        });
    }, []);

    useEffect(() => {
        const handleKeydown = (e: KeyboardEvent) => {
            if (!selectedPrompt) return;

            if (e.key === 'Escape') {
                closeModal();
            } else if (e.key === 'ArrowLeft') {
                navigatePrompt('prev');
            } else if (e.key === 'ArrowRight') {
                navigatePrompt('next');
            } else if (e.key === 'c' || e.key === 'C') {
                copyToClipboard(selectedPrompt.value, selectedPrompt.id);
            }
        };

        if (selectedPrompt) {
            document.addEventListener('keydown', handleKeydown);
        }

        return () => {
            document.removeEventListener('keydown', handleKeydown);
        };
    }, [selectedPrompt, closeModal, navigatePrompt, copyToClipboard]);

    if (loading) {
        return (
            <div className={className ?? "not-prose my-8"}>
                <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                </div>
            </div>
        );
    }

    return (
        <div className={className ?? "not-prose my-8"}>
            {/* Search Bar */}
            <div className="mb-6 relative">
                <div className="relative">
                    <input
                        type="text"
                        placeholder="Search prompts by name, id, or content..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full px-4 py-3 pl-12 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                    />
                    <svg
                        className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                    </svg>
                    {searchQuery && (
                        <button type="button"
                            onClick={() => setSearchQuery('')}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                            </svg>
                        </button>
                    )}
                </div>
                <div className="mt-2 flex items-center justify-between">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                        {filteredPrompts.length > 0 ? (
                            <>
                                Showing {((currentPage - 1) * ITEMS_PER_PAGE) + 1}-{Math.min(currentPage * ITEMS_PER_PAGE, filteredPrompts.length)} of {filteredPrompts.length} prompts
                                {searchQuery && ` (filtered from ${prompts.length} total)`}
                            </>
                        ) : (
                            `0 of ${prompts.length} prompts`
                        )}
                    </p>

                    {/* Mini Navigation */}
                    {totalPages > 1 && (
                        <div className="flex items-center gap-3 text-sm">
                            <button type="button"
                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                disabled={currentPage === 1}
                                className="flex items-center gap-1 text-gray-600 dark:text-gray-400 hover:text-primary dark:hover:text-primary disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:text-gray-600 dark:disabled:hover:text-gray-400 transition-colors"
                            >
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
                                </svg>
                                <span>prev</span>
                            </button>
                            <span className="text-xs text-gray-500 dark:text-gray-500">
                                {currentPage} / {totalPages}
                            </span>
                            <button type="button"
                                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                disabled={currentPage === totalPages}
                                className="flex items-center gap-1 text-gray-600 dark:text-gray-400 hover:text-primary dark:hover:text-primary disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:text-gray-600 dark:disabled:hover:text-gray-400 transition-colors"
                            >
                                <span>next</span>
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                                </svg>
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Prompts Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {paginatedPrompts.map((prompt) => (
                    <div
                        key={prompt.id}
                        className="group relative overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:shadow-lg hover:border-primary/50 dark:hover:border-primary/50 transition-all duration-200 cursor-zoom-in"
                        onClick={() => openModal(prompt)}
                    >
                        <div className="p-4">
                            <div className="flex items-start justify-between gap-2 mb-2">
                                <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 group-hover:text-primary dark:group-hover:text-primary transition-colors line-clamp-2">
                                    {prompt.name}
                                </h3>
                                <button type="button"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        copyToClipboard(prompt.value, prompt.id);
                                    }}
                                    className="flex-shrink-0 p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                    title="Copy prompt"
                                >
                                    {copiedId === prompt.id ? (
                                        <svg className="w-4 h-4 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                                        </svg>
                                    ) : (
                                        <svg className="w-4 h-4 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
                                        </svg>
                                    )}
                                </button>
                            </div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 font-mono mb-3">
                                {prompt.id}
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-3">
                                {prompt.value}
                            </p>
                        </div>
                    </div>
                ))}
            </div>

            {filteredPrompts.length === 0 && (
                <div className="text-center py-12">
                    <svg className="mx-auto w-16 h-16 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                    <p className="text-gray-600 dark:text-gray-400">No prompts found matching your search.</p>
                </div>
            )}

            {/* Modal */}
            {selectedPrompt && (() => {
                const currentIndex = filteredPrompts.findIndex(p => p.id === selectedPrompt.id);
                const hasPrev = currentIndex > 0;
                const hasNext = currentIndex < filteredPrompts.length - 1;

                return (
                    <div
                        onClick={closeModal}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
                    >
                        {/* Previous Button - Left Side */}
                        {hasPrev && (
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    navigatePrompt('prev');
                                }}
                                className="absolute left-4 top-1/2 -translate-y-1/2 z-10 p-3 bg-white/90 dark:bg-gray-800/90 hover:bg-white dark:hover:bg-gray-800 rounded-full shadow-lg transition-all hover:scale-110"
                                title="Previous prompt (←)"
                            >
                                <svg className="w-6 h-6 text-gray-800 dark:text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
                                </svg>
                            </button>
                        )}

                        {/* Next Button - Right Side */}
                        {hasNext && (
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    navigatePrompt('next');
                                }}
                                className="absolute right-4 top-1/2 -translate-y-1/2 z-10 p-3 bg-white/90 dark:bg-gray-800/90 hover:bg-white dark:hover:bg-gray-800 rounded-full shadow-lg transition-all hover:scale-110"
                                title="Next prompt (→)"
                            >
                                <svg className="w-6 h-6 text-gray-800 dark:text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                                </svg>
                            </button>
                        )}

                        <div
                            onClick={(e) => e.stopPropagation()}
                            className="relative max-w-4xl w-full max-h-[90vh] bg-white dark:bg-gray-800 rounded-xl shadow-2xl overflow-hidden flex flex-col"
                        >
                            {/* Header */}
                            <div className="flex items-start justify-between gap-4 p-6 border-b border-gray-200 dark:border-gray-700">
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-3 mb-2">
                                        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                                            {selectedPrompt.name}
                                        </h2>
                                        <span className="text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap">
                                            {currentIndex + 1} / {filteredPrompts.length}
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 font-mono">
                                        {selectedPrompt.id}
                                    </p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            copyToClipboard(selectedPrompt.value, selectedPrompt.id);
                                        }}
                                        className="flex-shrink-0 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                                        title="Copy prompt (C)"
                                    >
                                        {copiedId === selectedPrompt.id ? (
                                            <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                                            </svg>
                                        ) : (
                                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
                                            </svg>
                                        )}
                                    </button>
                                    <button
                                        onClick={closeModal}
                                        className="flex-shrink-0 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                                    >
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                                        </svg>
                                    </button>
                                </div>
                            </div>

                        {/* Content */}
                        <div className="flex-1 overflow-y-auto p-6">
                            <div className="prose dark:prose-invert max-w-none">
                                <pre className="whitespace-pre-wrap bg-gray-50 dark:bg-gray-900 p-4 rounded-lg text-sm text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-700">
{selectedPrompt.value}
                                </pre>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="flex items-center justify-between gap-4 p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
                            <div className="flex items-center gap-4">
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    {selectedPrompt.value.length} characters
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-500 hidden sm:block">
                                    Press <kbd className="px-1.5 py-0.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded">C</kbd> to copy, <kbd className="px-1.5 py-0.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded">←</kbd><kbd className="px-1.5 py-0.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded">→</kbd> to navigate
                                </p>
                            </div>
                            <button type="button"
                                onClick={() => copyToClipboard(selectedPrompt.value, selectedPrompt.id)}
                                className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                                title="Copy prompt (C)"
                            >
                                {copiedId === selectedPrompt.id ? (
                                    <>
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                                        </svg>
                                        Copied!
                                    </>
                                ) : (
                                    <>
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
                                        </svg>
                                        Copy Prompt
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
                );
            })()}
        </div>
    );
}
