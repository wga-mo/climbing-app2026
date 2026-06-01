export default function GuidebooksList({ guidebooks }) {
  if (!guidebooks?.length) {
    return null;
  }

  // Primary book first
  const sortedBooks = [...guidebooks].sort(
    (a, b) => Number(b.primary_book) - Number(a.primary_book)
  );

  const singleBook = sortedBooks.length === 1;

  // console.log(guidebooks[0].guidebooks.name);

  return (
    <section className="mt-6">
      <h2 className="text-xl font-semibold">
        Guidebooks
      </h2>

      <div className="mt-3 space-y-1">
        {sortedBooks.map(book => (
          <div key={book.book_id}>
            • {book.guidebooks.link ? (
              
        <a
          href={book.guidebooks.link}
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:text-blue-600"
        >
          {book.guidebooks.name}
        </a>
      ) : (
        book.guidebooks.name
      )}
            {book.page && (
              <> — Page: {book.page}</>
            )}

            {book.primary_book && !singleBook && (
              <span className="ml-1 font-semibold">
                *
              </span>
            )}
          </div>
        ))}
      </div>

      {!singleBook &&
        sortedBooks.some(book => book.primary_book) && (
          <p className="mt-2 text-sm text-gray-600">
            * The information on this page comes from this book.
          </p>
        )}
    </section>
  );
}