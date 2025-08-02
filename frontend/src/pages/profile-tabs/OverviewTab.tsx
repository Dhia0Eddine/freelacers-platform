
interface OverviewTabProps {
  profile: any;
}

export default function OverviewTab({ profile }: OverviewTabProps) {
  // ...copy the overview tab content from ProfilePage here...
  // For brevity, just render the bio section as an example:
  return (
    <div className="flex flex-col lg:flex-row gap-6 mb-16">
      <div className="w-full space-y-6">
        {(profile?.bio) && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 transition-all duration-300 hover:shadow-md">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">About Me</h2>
            <p className="text-gray-600 dark:text-gray-300 whitespace-pre-line leading-relaxed">
              {profile.bio}
            </p>
          </div>
        )}
      </div>
      {/* ...add latest updates or other sections as needed... */}
    </div>
  );
}
