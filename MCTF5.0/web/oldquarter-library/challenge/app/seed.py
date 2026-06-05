import os
import sqlite3
import datetime

DB_PATH = os.environ.get('LIBRARY_DB', '/var/lib/library/library.db')

SCHEMA = """
CREATE TABLE IF NOT EXISTS books (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    author TEXT NOT NULL,
    year INTEGER,
    genre TEXT,
    isbn TEXT,
    description TEXT,
    loan_count INTEGER DEFAULT 0,
    available INTEGER DEFAULT 1,
    added_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS staff (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    role TEXT NOT NULL,
    last_login TEXT
);

CREATE INDEX IF NOT EXISTS idx_books_genre ON books(genre);
CREATE INDEX IF NOT EXISTS idx_books_author ON books(author);
"""

BOOKS = [
    ("Pride and Prejudice", "Jane Austen", 1813, "Classic", "9780141439518",
     "A timeless romance set in Regency England, exploring class, marriage, and misunderstanding through the wit of Elizabeth Bennet.", 142),
    ("1984", "George Orwell", 1949, "Dystopian", "9780451524935",
     "A chilling vision of a totalitarian future where Big Brother watches every move and language itself is weaponised.", 203),
    ("To Kill a Mockingbird", "Harper Lee", 1960, "Classic", "9780061120084",
     "Through the eyes of Scout Finch, a Southern town confronts injustice during the trial of a Black man wrongly accused.", 178),
    ("The Great Gatsby", "F. Scott Fitzgerald", 1925, "Classic", "9780743273565",
     "Jay Gatsby's pursuit of an impossible dream against the glittering ruin of Long Island in the Jazz Age.", 156),
    ("One Hundred Years of Solitude", "Gabriel García Márquez", 1967, "Magical Realism", "9780060883287",
     "The Buendía family's saga unfolds across generations in the mythical town of Macondo.", 89),
    ("The Name of the Rose", "Umberto Eco", 1980, "Mystery", "9780156001311",
     "A 14th-century Franciscan friar investigates a series of deaths in a remote Italian abbey.", 67),
    ("Beloved", "Toni Morrison", 1987, "Historical Fiction", "9781400033416",
     "A formerly enslaved woman is haunted, literally and figuratively, by the daughter she lost.", 94),
    ("The Left Hand of Darkness", "Ursula K. Le Guin", 1969, "Science Fiction", "9780441478125",
     "An envoy on a frozen world discovers a society where gender is fluid and politics is glacial.", 73),
    ("Crime and Punishment", "Fyodor Dostoevsky", 1866, "Classic", "9780486415871",
     "A destitute student in St. Petersburg commits murder and unravels under the weight of his own conscience.", 121),
    ("The Master and Margarita", "Mikhail Bulgakov", 1967, "Magical Realism", "9780143108276",
     "The Devil arrives in Soviet Moscow with a black cat, a retinue, and a knack for exposing hypocrisy.", 58),
    ("Dune", "Frank Herbert", 1965, "Science Fiction", "9780441172719",
     "On the desert planet Arrakis, ecology, religion, and politics collide around the most precious substance in the universe.", 187),
    ("The Brothers Karamazov", "Fyodor Dostoevsky", 1880, "Classic", "9780374528379",
     "A patricide tears apart three brothers, each embodying a different answer to the question of faith.", 64),
    ("Wuthering Heights", "Emily Brontë", 1847, "Classic", "9780141439556",
     "Love and revenge tangle on the Yorkshire moors, narrated by a housekeeper who has seen too much.", 88),
    ("The Trial", "Franz Kafka", 1925, "Classic", "9780805210408",
     "Joseph K. is arrested for an unspecified crime and prosecuted by an inscrutable bureaucracy.", 76),
    ("Invisible Cities", "Italo Calvino", 1972, "Literary Fiction", "9780156453806",
     "Marco Polo describes impossible cities to an aging Kublai Khan; each is a meditation on memory and longing.", 41),
    ("Norwegian Wood", "Haruki Murakami", 1987, "Literary Fiction", "9780375704024",
     "A coming-of-age story of love, grief, and Tokyo in the late 1960s.", 102),
    ("Things Fall Apart", "Chinua Achebe", 1958, "Literary Fiction", "9780385474542",
     "The arrival of European missionaries in pre-colonial Igboland, told through the proud and tragic Okonkwo.", 81),
    ("The Remains of the Day", "Kazuo Ishiguro", 1989, "Literary Fiction", "9780679731726",
     "An English butler reflects on a lifetime of service and the dignified mistakes that shaped it.", 63),
    ("Frankenstein", "Mary Shelley", 1818, "Gothic", "9780486282114",
     "An ambitious scientist creates life and learns that creation comes with debts that cannot be settled.", 109),
    ("Mrs Dalloway", "Virginia Woolf", 1925, "Modernist", "9780156628709",
     "A single day in postwar London, threading the lives of a society hostess and a shell-shocked veteran.", 49),
    ("The Sound and the Fury", "William Faulkner", 1929, "Modernist", "9780679732242",
     "The decline of a Southern family told in four voices, each more disorienting than the last.", 34),
    ("If on a winter's night a traveler", "Italo Calvino", 1979, "Literary Fiction", "9780156439619",
     "A novel about reading itself, in which 'you' the reader become its protagonist.", 28),
    ("The Man Who Mistook His Wife for a Hat", "Oliver Sacks", 1985, "Non-fiction", "9780684853949",
     "Case studies from a neurologist's notebook that read like short stories about the strangeness of the mind.", 71),
    ("Sapiens", "Yuval Noah Harari", 2011, "Non-fiction", "9780062316097",
     "A sweeping account of how Homo sapiens came to dominate the planet, for better and frequently for worse.", 134),
    ("The Code Book", "Simon Singh", 1999, "Non-fiction", "9780385495325",
     "A history of cryptography from Caesar ciphers to public-key, written for the curious rather than the cleared.", 54),
    ("Gödel, Escher, Bach", "Douglas Hofstadter", 1979, "Non-fiction", "9780465026562",
     "A meditation on minds, machines, and self-reference that loops in on itself by design.", 47),
]


def init_db():
    os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)
    conn = sqlite3.connect(DB_PATH)
    conn.executescript(SCHEMA)

    count = conn.execute('SELECT COUNT(*) FROM books').fetchone()[0]
    if count == 0:
        for row in BOOKS:
            conn.execute(
                'INSERT INTO books (title, author, year, genre, isbn, description, loan_count) '
                'VALUES (?, ?, ?, ?, ?, ?, ?)', row
            )
        conn.execute(
            "INSERT OR IGNORE INTO staff (username, role) VALUES (?, ?), (?, ?)",
            ('m.harker', 'librarian', 'a.dupont', 'archivist')
        )
        conn.commit()

    conn.close()
    print(f'db initialised at {DB_PATH}')


if __name__ == '__main__':
    init_db()
