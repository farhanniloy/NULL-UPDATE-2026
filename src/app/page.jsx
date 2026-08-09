export const dynamic = "force-dynamic";

import styles from "./homepage.module.css";
import CategoryList from "@/components/categoryList/CategoryList";
import Featured from "@/components/featured/Featured";
import CardList from "@/components/cardList/CardList";

export default function Home({ searchParams }) {
  const page = parseInt(searchParams.page) || 1;

  return (
      <div className={styles.container}>
          <Featured />
          <CategoryList />
          <div className={styles.container}>
              <CardList page={page} />
          </div>
      </div>
  );
}
