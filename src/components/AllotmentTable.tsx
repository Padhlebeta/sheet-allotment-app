import { useState } from 'react';
// import { Save } from 'lucide-react'; // Removed unused
import { IAllotment } from '@/models/Allotment';

const ERROR_OPTIONS = [
    'Wrong Solution',
    'Incorrect Answer Key',
    'No Correct Option',
    'Incorrect Question',
    'Incomplete Question',
    'Other Issues'
];

export default function AllotmentTable({ initialData, onDataChange }: { initialData: IAllotment[], onDataChange: () => void }) {
    const [loadingIds, setLoadingIds] = useState<Set<string>>(new Set());

    const handleUpdate = async (row: IAllotment, updates: Partial<IAllotment>) => {

        setLoadingIds(prev => new Set(prev).add(row._id as string));
        try {
            const res = await fetch('/api/update-allotment', {
                method: 'POST',

                body: JSON.stringify({ id: row._id, ...updates })
            });

            if (!res.ok) throw new Error('Update failed');

            // Ideally update local state optimistically, but for now we reload or just show success
            onDataChange();
        } catch {
            alert('Failed to save');
        } finally {
            setLoadingIds(prev => {
                const next = new Set(prev);

                next.delete(row._id as string);
                return next;
            });
        }
    };

    // Internal state for inputs before submitting?
    // For "Video Link" user might want to type and then click submit.
    // Let's create a sub-component for the row or manage temporary state.
    // For simplicity, we can use uncontrolled inputs or local state per row.

    return (
        <div className="w-full overflow-x-auto pb-20">
            <table className="w-full text-sm text-left border-collapse min-w-[1500px]">
                <thead className="bg-gray-100 text-gray-900 font-bold sticky top-0 z-0 shadow-sm">
                    <tr>
                        <th className="p-3 border-y border-gray-200 w-12 text-center">#</th>
                        <th className="p-3 border-y border-gray-200">Cohort</th>
                        <th className="p-3 border-y border-gray-200">Class</th>
                        <th className="p-3 border-y border-gray-200">Subject</th>
                        <th className="p-3 border-y border-gray-200">Module No.</th>
                        <th className="p-3 border-y border-gray-200">Chapter Number</th>
                        <th className="p-3 border-y border-gray-200 max-w-[150px]">Chapter Name</th>
                        <th className="p-3 border-y border-gray-200">Exercise Name</th>
                        <th className="p-3 border-y border-gray-200 text-center">Q. No.</th>
                        <th className="p-3 border-y border-gray-200 text-center">QBG ID Links</th>
                        <th className="p-3 border-y border-gray-200 text-center">Text Solution Available?</th>
                        <th className="p-3 border-y border-gray-200 text-center">PPT Link</th>
                        <th className="p-3 border-y border-gray-200 text-center">Video Folder Link</th>

                        {/* Editable Area */}
                        <th className="p-3 border-y border-gray-200 bg-blue-50/50 min-w-[250px]">Video Link</th>
                        <th className="p-3 border-y border-gray-200 bg-blue-50/50 min-w-[200px]">Question Error Identified</th>
                        <th className="p-3 border-y border-gray-200">VS Link Addition Date</th>
                        <th className="p-3 border-y border-gray-200">VS Allotment Date</th>
                        <th className="p-3 border-y border-gray-200">Status</th>
                        <th className="p-3 border-y border-gray-200 text-center">Submit</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 bg-white">
                    {initialData.map((row) => (

                        <Row key={row._id} row={row} onSave={handleUpdate} saving={loadingIds.has(row._id as string)} />
                    ))}
                    {initialData.length === 0 && (
                        <tr>
                            <td colSpan={18} className="p-10 text-center text-gray-400">
                                No tasks allotted to you found.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
}

function Row({ row, onSave, saving }: { row: IAllotment, onSave: (r: IAllotment, u: Partial<IAllotment>) => void, saving: boolean }) {
    const [videoLink, setVideoLink] = useState(row.videoLink || '');
    const [error, setError] = useState(row.questionErrorIdentified || '');

    // Check if dirty
    const isDirty = videoLink !== (row.videoLink || '') || error !== (row.questionErrorIdentified || '');

    const handleSave = () => {
        onSave(row, {
            videoLink,
            questionErrorIdentified: error,
            status: (videoLink && videoLink.length > 5) ? 'Submitted' : 'Pending'
        });
    };

    const linkStyle = "text-blue-600 hover:text-blue-800 underline truncate max-w-[100px] block";

    return (
        <tr className="hover:bg-gray-50 group transition-colors text-gray-900 border-b border-gray-100">
            <td className="p-3 text-center text-gray-500 font-mono text-xs">{row.sheetRowId}</td>
            <td className="p-3 font-medium">{row.cohort}</td>
            <td className="p-3">{row.class}</td>
            <td className="p-3">{row.subject}</td>
            <td className="p-3 text-center">{row.moduleNo}</td>
            <td className="p-3 text-center">{row.chapterNumber}</td>
            <td className="p-3 truncate max-w-[150px]" title={row.chapterName}>{row.chapterName}</td>
            <td className="p-3 truncate max-w-[150px]" title={row.exerciseName}>{row.exerciseName}</td>
            <td className="p-3 text-center font-semibold">{row.qNo}</td>
            <td className="p-3 text-center">
                {row.qbgIdLinks && <a href={row.qbgIdLinks} target="_blank" className={linkStyle}>View QBG</a>}
            </td>
            <td className="p-3 text-center">{row.textSolutionAvailable}</td>
            <td className="p-3 text-center">
                {row.pptLink && <a href={row.pptLink} target="_blank" className={linkStyle}>PPT</a>}
            </td>
            <td className="p-3 text-center">
                {row.videoFolderLink && <a href={row.videoFolderLink} target="_blank" className={linkStyle}>Folder</a>}
            </td>

            {/* Editable Inputs */}
            <td className="p-2 bg-blue-50/30">
                <div className="flex items-center gap-1">
                    <input
                        type="text"
                        value={videoLink}
                        onChange={(e) => setVideoLink(e.target.value)}
                        placeholder="Paste Link"
                        className="w-full px-2 py-2 border border-gray-300 rounded text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-xs"
                    />
                    {videoLink && (
                        <a
                            href={videoLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 text-blue-600 hover:bg-blue-100 rounded-md transition-colors"
                            title="Open Video Link"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                            </svg>
                        </a>
                    )}
                </div>
            </td>
            <td className="p-2 bg-blue-50/30">
                <select
                    value={error}
                    onChange={(e) => setError(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none text-sm bg-white"
                    aria-label="Select Question Error"
                >
                    <option value="">-- Select --</option>
                    {ERROR_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </select>
            </td>

            <td className="p-3 text-gray-600 text-xs">{row.vsLinkAdditionDate}</td>
            <td className="p-3 text-gray-600 text-xs">{row.vsAllotmentDate}</td>
            <td className="p-3">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${row.status === 'Submitted'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-yellow-100 text-yellow-800'
                    }`}>
                    {row.status || 'Pending'}
                </span>
            </td>
            <td className="p-2 text-center">
                <button
                    onClick={handleSave}
                    disabled={!isDirty || saving}
                    className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white focus:outline-none focus:ring-2 focus:ring-offset-2 ${isDirty
                        ? 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500'
                        : 'bg-gray-300 cursor-not-allowed'
                        } ${saving ? 'opacity-75 cursor-wait' : ''}`}
                >
                    {saving ? 'Saving...' : 'Submit'}
                </button>
            </td>
        </tr>
    );
}
