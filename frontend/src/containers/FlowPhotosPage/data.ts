import { GetStaticProps } from 'next';

import { HeadProps } from 'utils/seo/Head';
import { ISR_TIMEOUT } from 'utils/functions/getIsrTimeout';
import { getLocalizedText } from 'utils/i18n';
import { ProjectData } from 'utils/types/strapi/ProjectData';
import { getProjectData } from 'utils/functions/strapi/getProjectData';

export interface PageProps {
  head: HeadProps;
  projectData: ProjectData;
}

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  const projectData = (await getProjectData('stack-tower')) as ProjectData;
  const projectHead = projectData.localizedHead;

  const head = {
    title: getLocalizedText(projectHead.localizedTitle, locale),
    description: getLocalizedText(projectHead.localizedDescription, locale),
    ogType: projectHead.ogType,
    ogImage: projectHead.ogImage,
  };

  return {
    props: {
      projectData,
      head,
    },
    revalidate: ISR_TIMEOUT,
  };
};