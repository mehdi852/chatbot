import { notFound } from 'next/navigation';
import { getPageBySlug } from '@/utils/AdminUtils';

async function getPageData(slug) {
    const pageData = await getPageBySlug(slug);
    return pageData;
}

export default async function DynamicPage({ params }) {
    const pageData = await getPageData(params.slug);

    if (!pageData) {
        notFound();
    }

    return (
        <div className="min-h-screen">
            <div 
                className="max-w-[1300px] mx-auto px-4 my-10 prose prose-lg"
                dangerouslySetInnerHTML={{ __html: pageData.content }} 
            />
        </div>
    );
}
