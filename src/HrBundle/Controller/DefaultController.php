<?php
/**
 * Created by PhpStorm.
 * User: H.R.
 * Date: 15/01/15
 * Time: 23:10
 */

namespace HrBundle\Controller;

use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;

class DefaultController extends Controller
{
    /**
     * @Route("/app/example", name="homepage")
     */
    public function indexAction()
    {
        return $this->render('HrBundle:Default:index.html.twig');
    }

    /**
     * @Route("/app/example", name="homepage")
     */
    public function testsAction()
    {
        return $this->render('HrBundle:Default:tests.html.twig');
    }
}
