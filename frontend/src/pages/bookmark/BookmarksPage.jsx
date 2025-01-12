import { Link, useParams } from "react-router-dom";

import Posts from "../../components/common/Posts";

import { FaArrowLeft } from "react-icons/fa6";
import { useQuery } from "@tanstack/react-query";

const BookmarksPage = () => {
	const { username } = useParams();

	const userQuery = useQuery({
			queryKey: ["userProfile"],
			queryFn: async () => {
					try {
							const res = await fetch(`/api/users/profile/${username}`);
							const data = await res.json();

							if (!res.ok) throw new Error(data.error || "Something went wrong");
							return data._id;
					} catch (error) {
							throw new Error(error);
					}
			}
	})

	return (
		<>
			<div className='flex-[4_4_0]  border-r border-gray-700 min-h-screen '>
				<div className='flex flex-col'>
					<div className='flex gap-10 px-4 py-2 items-center'>
						<Link to='/'>
							<FaArrowLeft className='w-4 h-4' />
						</Link>
						<div className='flex flex-col'>
							<p className='font-bold text-lg'>Bookmarks</p>
						</div>
					</div>


					<Posts feedType={"bookmarks"} username={username} userId={userQuery.data}/>
				</div>
			</div>
		</>
	);
};
export default BookmarksPage;