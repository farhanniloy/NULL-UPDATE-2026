import { NextResponse } from "next/server";
import prisma from "@/utils/connect";

const defaultCategories = [
    { slug: 'philosophy', title: 'Philosophy' },
    { slug: 'infiltration', title: 'Infiltration' },
    { slug: 'science', title: 'Science' },
    { slug: 'programs', title: 'Programs' },
    { slug: 'projects', title: 'Projects' },
];

export const GET = async () => {
    try {
        const categories = await prisma.category.findMany();
        if (!categories || categories.length === 0) {
            await prisma.category.createMany({ data: defaultCategories, skipDuplicates: true });
            return new NextResponse(JSON.stringify(defaultCategories), { status: 200 });
        }

        return new NextResponse(JSON.stringify(categories), { status: 200 });
    } catch (err) {
        console.log(err);
        return new NextResponse(
            JSON.stringify({ message: "Something went wrong!" }),
            { status: 500 }
        );
    }
};
