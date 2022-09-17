-- CreateTable
CREATE TABLE "UsersOnBlogs" (
    "userId" INTEGER NOT NULL,
    "blogId" INTEGER NOT NULL,

    CONSTRAINT "UsersOnBlogs_pkey" PRIMARY KEY ("userId","blogId")
);

-- AddForeignKey
ALTER TABLE "UsersOnBlogs" ADD CONSTRAINT "UsersOnBlogs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UsersOnBlogs" ADD CONSTRAINT "UsersOnBlogs_blogId_fkey" FOREIGN KEY ("blogId") REFERENCES "Blog"("id") ON DELETE CASCADE ON UPDATE CASCADE;
